import { afterEach, describe, expect, it } from "vitest";
import { AbstractComponent } from "./component";
import { componentsRegistryService, clearRegistryInstancesForTests } from "./components-registry.service";
import {
  clearRouterRulesForTests,
  RouteUrlBucket,
  routerService,
} from "./router.service";
import type { ComponentsList } from "./types/interfaces";
import type { Template } from "./template";

type AnyWeakRef<T extends object> = {
  deref(): T | undefined;
};

const HAS_GC = typeof (globalThis as { gc?: () => void }).gc === "function";

function runGc() {
  (globalThis as { gc: () => void }).gc();
}

async function flushMicrotasks() {
  await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
}

async function flushPromises() {
  await flushMicrotasks();
  await flushMicrotasks();
}

function releaseForGc(...components: AbstractComponent[]) {
  for (const comp of components) {
    if (comp.template) breakTemplateGraph(comp.template);
    if (comp.node) {
      comp.node.innerHTML = "";
      comp.node.remove();
      comp.node = null;
    }
    comp.template = null;
  }
}

function breakTemplateGraph(template: Template) {
  const t = template as any;
  t.self = (): null => null;
  t.node = null;
  t.children = null;
  t.parent = null;
  t.root = null;
  t.domStructureChanged = null;
}

type FinalizationRegistryConstructor = new (
  cleanup: (heldValue: unknown) => void,
) => {
  register(target: object, heldValue?: unknown): void;
};

const FinalizationRegistryGlobal = (
  globalThis as { FinalizationRegistry?: FinalizationRegistryConstructor }
).FinalizationRegistry;

async function waitForGc(registerTarget: (register: (obj: object) => void) => void | Promise<void>) {
  if (!FinalizationRegistryGlobal) {
    throw new Error("FinalizationRegistry is not available in this environment");
  }

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("object was not collected by GC")), 5000);
    const registry = new FinalizationRegistryGlobal(() => {
      clearTimeout(timer);
      resolve();
    });

    void Promise.resolve(registerTarget((obj) => registry.register(obj, "target"))).then(() => {
      void collectGarbage();
    });
  });
}

async function collectGarbage() {
  if (!HAS_GC) return;

  for (let i = 0; i < 4; i++) {
    runGc();
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
}

function heapUsedBytes() {
  if (HAS_GC) runGc();
  return process.memoryUsage().heapUsed;
}

function resetRegistry() {
  componentsRegistryService.componentsRoot.length = 0;
  componentsRegistryService.listBySelector.clear();
  componentsRegistryService.buckets = {};
  clearRegistryInstancesForTests();
}

function resetRouter() {
  clearRouterRulesForTests();
  routerService.setHashMode(false);
  (routerService as any).completedComponentRules = [];
  routerService.pathname$.update("");
  routerService.search$.update("");
  routerService.resourcesLoading$.update(false);
  history.replaceState(null, "", "/");
}

function mountComponent<T extends AbstractComponent>(
  Cls: AbstractComponentConstructor<T>,
  parent: ParentNode = document.body,
) {
  componentsRegistryService.define(Cls);

  const node = document.createElement(Cls.selector);
  parent.appendChild(node);

  const list: ComponentsList = [];
  componentsRegistryService.connectBySelector(Cls.selector, list, parent);

  return { instance: list[0] as T, list, node };
}

type AbstractComponentConstructor<T extends AbstractComponent = AbstractComponent> = {
  new (): T;
  selector: string;
};

/**
 * After warm-up, heap samples should not drift upward without bound.
 * Allows 2.5× growth over the minimum sample + 1 MiB (GC noise in CI/local).
 */
function expectHeapSamplesStable(samples: number[]) {
  expect(samples.length).toBeGreaterThan(1);

  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const budget = Math.max(min * 2.5 + 1024 * 1024, 3 * 1024 * 1024);

  expect(max).toBeLessThan(budget);
}

async function sampleHeapWhileRunning(
  cycles: number,
  batchSize: number,
  runCycle: () => void | Promise<void>,
) {
  const samples: number[] = [];

  for (let i = 0; i < 5; i++) {
    await runCycle();
  }
  await collectGarbage();

  for (let batch = 0; batch < cycles; batch++) {
    for (let i = 0; i < batchSize; i++) {
      await runCycle();
    }
    await collectGarbage();
    samples.push(heapUsedBytes());
  }

  return samples;
}

describe.skipIf(!HAS_GC)("lifecycle heap profiling (requires node --expose-gc)", () => {
  afterEach(async () => {
    resetRegistry();
    resetRouter();
    document.body.innerHTML = "";
    await collectGarbage();
  });

  it("collects mounted components after disconnect", async () => {
    class HeapComponent extends AbstractComponent {
      static selector = "heap-component";

      getHTML() {
        return `<span class="heap">{{root.label$::rx}}</span>`;
      }

      label$ = this.newRx("x");
    }

    await waitForGc((register) => {
      const { instance, list } = mountComponent(HeapComponent);
      register(instance);
      componentsRegistryService.removeComponents(list, true);
      releaseForGc(instance);
      list.length = 0;
    });
  });

  it("collects template trees after disconnect", async () => {
    class HeapTemplateSimpleComponent extends AbstractComponent {
      static selector = "heap-template-simple-component";

      count$ = this.newRx(0);

      getHTML() {
        return `<span data-testid="val">{{root.count$::rx}}</span>`;
      }
    }

    await waitForGc(async (register) => {
      const { instance, list } = mountComponent(HeapTemplateSimpleComponent);
      const template = instance.template!;
      register(template);

      instance.count$.update(42);
      await flushPromises();
      componentsRegistryService.removeComponents(list, true);
      releaseForGc(instance);
      breakTemplateGraph(template);
      list.length = 0;
    });
  });

  it("collects routed page components after route swaps", async () => {
    class HeapHomePage extends AbstractComponent {
      static selector = "heap-home-page";
      getHTML() {
        return `<p>home</p>`;
      }
    }

    class HeapDocsPage extends AbstractComponent {
      static selector = "heap-docs-page";
      getHTML() {
        return `<p>docs</p>`;
      }
    }

    componentsRegistryService.define(HeapHomePage);
    componentsRegistryService.define(HeapDocsPage);
    document.body.innerHTML = `<main id="app"></main>`;

    new RouteUrlBucket({
      home: {
        url: "/",
        componentSelectorUnbox: () => HeapHomePage.selector,
        routeSelectorUnbox: () => "#app",
      },
      docs: {
        url: "/docs/:slug",
        componentSelectorUnbox: () => HeapDocsPage.selector,
        routeSelectorUnbox: () => "#app",
      },
    });

    const refs: AnyWeakRef<AbstractComponent>[] = [];
    let prev: AbstractComponent | undefined;

    for (let i = 0; i < 6; i++) {
      routerService.pushHistory(i % 2 === 0 ? "/" : "/docs/intro");
      await flushPromises();

      const rules = (routerService as any).completedComponentRules as Array<{
        components: ComponentsList;
      }>;
      const live = rules[0]?.components[0];
      expect(live).toBeDefined();

      if (prev && prev !== live) {
        expect(prev.destroyed).toBe(true);
        refs.push(new (globalThis as any).WeakRef(prev));
        releaseForGc(prev);
        prev = undefined;
      }

      prev = live;
    }

    (routerService as any).completedComponentRules = [];
    if (prev) releaseForGc(prev);
    document.body.innerHTML = "";

    await collectGarbage();

    expect(refs.length).toBeGreaterThan(0);
    expect(refs.every((ref) => ref.deref() === undefined)).toBe(true);
  });

  it("stable heap over repeated component mount/unmount cycles", async () => {
    class HeapCycleComponent extends AbstractComponent {
      static selector = "heap-cycle-component";

      count$ = this.newRx(0);
      label$ = this.newRxFunc((n) => `n=${n}`, this.count$);

      getHTML() {
        return `<span>{{root.label$::rx}}</span>`;
      }
    }

    const samples = await sampleHeapWhileRunning(8, 15, () => {
      const { list } = mountComponent(HeapCycleComponent);
      componentsRegistryService.removeComponents(list, true);
      document.body.innerHTML = "";
    });

    expectHeapSamplesStable(samples);
  });

  it("stable heap over repeat list grow/shrink cycles", async () => {
    class HeapRepeatComponent extends AbstractComponent {
      static selector = "heap-repeat-component";

      items$ = this.newRx([{ label: "a" }, { label: "b" }]);

      getHTML() {
        return `
          <ul repeat="{{root.items$::rx}}" let-label="{{this.label}}">
            <li class="heap-repeat-item">{{label}}</li>
          </ul>
        `;
      }
    }

    const samples = await sampleHeapWhileRunning(8, 10, async () => {
      const { instance, list } = mountComponent(HeapRepeatComponent);

      instance.items$.update([{ label: "x" }, { label: "y" }, { label: "z" }]);
      await flushMicrotasks();
      instance.items$.update([{ label: "solo" }]);
      await flushMicrotasks();
      instance.items$.update([]);
      await flushMicrotasks();

      componentsRegistryService.removeComponents(list, true);
      document.body.innerHTML = "";
    });

    expectHeapSamplesStable(samples);
  });

  it("stable heap over attached toggle cycles", async () => {
    class HeapAttachedComponent extends AbstractComponent {
      static selector = "heap-attached-component";

      open$ = this.newRx(false);

      getHTML() {
        return `
          <section attached="{{root.open$::rx}}">
            <p class="heap-attached-body">body</p>
          </section>
        `;
      }
    }

    const samples = await sampleHeapWhileRunning(8, 12, async () => {
      const { instance, list } = mountComponent(HeapAttachedComponent);

      for (let i = 0; i < 6; i++) {
        instance.open$.update(i % 2 === 0);
        await flushMicrotasks();
      }

      componentsRegistryService.removeComponents(list, true);
      document.body.innerHTML = "";
    });

    expectHeapSamplesStable(samples);
  });

  it("stable heap over router navigation cycles", async () => {
    class HeapNavHome extends AbstractComponent {
      static selector = "heap-nav-home";
      getHTML() {
        return `<p>home</p>`;
      }
    }

    class HeapNavDocs extends AbstractComponent {
      static selector = "heap-nav-docs";
      getHTML() {
        return `<p>docs</p>`;
      }
    }

    componentsRegistryService.define(HeapNavHome);
    componentsRegistryService.define(HeapNavDocs);
    document.body.innerHTML = `<main id="app"></main>`;

    new RouteUrlBucket({
      home: {
        url: "/",
        componentSelectorUnbox: () => HeapNavHome.selector,
        routeSelectorUnbox: () => "#app",
      },
      docs: {
        url: "/docs/:slug",
        componentSelectorUnbox: () => HeapNavDocs.selector,
        routeSelectorUnbox: () => "#app",
      },
    });

    const samples = await sampleHeapWhileRunning(8, 10, async () => {
      for (let i = 0; i < 6; i++) {
        routerService.pushHistory(i % 2 === 0 ? "/" : "/docs/intro");
        await flushPromises();
      }

      resetRouter();
      document.body.innerHTML = `<main id="app"></main>`;

      new RouteUrlBucket({
        home: {
          url: "/",
          componentSelectorUnbox: () => HeapNavHome.selector,
          routeSelectorUnbox: () => "#app",
        },
        docs: {
          url: "/docs/:slug",
          componentSelectorUnbox: () => HeapNavDocs.selector,
          routeSelectorUnbox: () => "#app",
        },
      });
    });

    expectHeapSamplesStable(samples);
  });
});

describe("lifecycle heap profiling — environment", () => {
  it("documents how to run GC heap tests", () => {
    if (HAS_GC) {
      expect(typeof (globalThis as { gc?: () => void }).gc).toBe("function");
      return;
    }

    expect(HAS_GC).toBe(false);
  });
});
