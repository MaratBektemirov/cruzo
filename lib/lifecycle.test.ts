import { afterEach, describe, expect, it, vi } from "vitest";
import { AbstractComponent } from "./component";
import { componentsRegistryService, clearRegistryInstancesForTests } from "./components-registry.service";
import {
  clearRouterRulesForTests,
  RouteUrlBucket,
  routerService,
} from "./router.service";
import type { ComponentsList } from "./types/interfaces";
import { Rx } from "./rx";
import type { Template } from "./template";

async function flushMicrotasks() {
  await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
}

async function flushPromises() {
  await flushMicrotasks();
  await flushMicrotasks();
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

function countRegistryInstances() {
  const map = (componentsRegistryService as any).instancesBySelector as Record<
    string,
    Map<HTMLElement, AbstractComponent>
  >;
  let total = 0;
  for (const key of Object.keys(map)) {
    total += map[key]?.size ?? 0;
  }
  return total;
}

function countPostUpdateListeners(...rxs: Rx<any>[]) {
  let total = 0;
  for (const rx of rxs) {
    total += rx.postUpdateFns?.size ?? 0;
  }
  return total;
}

function countTemplateRxLinks(template: Template | null) {
  const rxAcc = (template as any)?.rxAcc as Map<Rx<any>, Map<Template, unknown>> | null;
  if (!rxAcc) return 0;

  let links = 0;
  for (const templatesMap of rxAcc.values()) {
    links += templatesMap.size;
  }
  return links;
}

function mountLeakComponent<T extends AbstractComponent>(
  Cls: new () => T,
  parent: ParentNode = document.body,
): { instance: T; list: ComponentsList } {
  componentsRegistryService.define(Cls as any);

  const node = document.createElement((Cls as any).selector);
  parent.appendChild(node);

  const list: ComponentsList = [];
  componentsRegistryService.connectBySelector((Cls as any).selector, list, parent);

  return { instance: list[0] as T, list };
}

afterEach(() => {
  resetRegistry();
  resetRouter();
  document.body.innerHTML = "";
});

describe("lifecycle — components registry", () => {
  it("does not accumulate instances after repeated mount/unmount", () => {
    class LeakTestComponent extends AbstractComponent {
      static selector = "leak-test-component";

      getHTML() {
        return `<span class="leak-test">ok</span>`;
      }
    }

    for (let i = 0; i < 12; i++) {
      const { list } = mountLeakComponent(LeakTestComponent);
      expect(list[0].destroyed).toBe(false);

      componentsRegistryService.removeComponents(list, true);
      expect(list).toHaveLength(0);
    }

    expect(countRegistryInstances()).toBe(0);
    expect(document.querySelector("leak-test-component")).toBeNull();
  });

  it("unsubscribes component rxList on disconnect", () => {
    class LeakRxComponent extends AbstractComponent {
      static selector = "leak-rx-component";

      count$ = this.newRx(0);
      derived$ = this.newRxFunc((n) => n * 2, this.count$);

      getHTML() {
        return `<span>{{root.count$::rx}}</span>`;
      }
    }

    const { instance, list } = mountLeakComponent(LeakRxComponent);

    expect(instance.rxList?.length).toBeGreaterThan(0);
    expect(instance.destroyed).toBe(false);

    componentsRegistryService.removeComponents(list, true);

    expect(instance.destroyed).toBe(true);
    expect(instance.rxList?.length).toBe(0);
  });
  it("unsubscribes every component RxFunc from an external Rx on disconnect", async () => {
    const external = new Rx<number>([], (value: number) => value, 0);
    const callbacks = Array.from({ length: 4 }, () => vi.fn((value: number) => value));

    class ExternalRxComponent extends AbstractComponent {
      static selector = "external-rx-component";
      derived = callbacks.map(callback => this.newRxFunc(callback, external));

      getHTML() {
        return "<span>external subscriptions</span>";
      }
    }

    const { instance, list } = mountLeakComponent(ExternalRxComponent);
    await flushMicrotasks();
    external.update(1);
    await flushMicrotasks();
    for (const callback of callbacks) {
      expect(callback).toHaveBeenLastCalledWith(1);
      callback.mockClear();
    }
    expect(countPostUpdateListeners(external)).toBe(4);

    componentsRegistryService.removeComponents(list, true);
    external.update(2);
    await flushMicrotasks();

    expect(instance.destroyed).toBe(true);
    expect(instance.rxList).toHaveLength(0);
    expect(countPostUpdateListeners(external)).toBe(0);
    for (const callback of callbacks) expect(callback).not.toHaveBeenCalled();
  });
});

describe("lifecycle — template", () => {
  it("clears Rx template links and listeners after disconnect", async () => {
    class LeakTemplateComponent extends AbstractComponent {
      static selector = "leak-template-component";

      count$ = this.newRx(0);

      getHTML() {
        return `<span data-testid="val">{{root.count$::rx}}</span>`;
      }
    }

    const { instance, list } = mountLeakComponent(LeakTemplateComponent);

    expect(countTemplateRxLinks(instance.template)).toBeGreaterThan(0);
    expect(countPostUpdateListeners(instance.count$)).toBeGreaterThan(0);

    instance.count$.update(3);
    await flushMicrotasks();
    expect(instance.node.querySelector('[data-testid="val"]')?.textContent).toBe("3");

    componentsRegistryService.removeComponents(list, true);

    expect(instance.destroyed).toBe(true);
    expect(countTemplateRxLinks(instance.template)).toBe(0);
    expect(countPostUpdateListeners(instance.count$)).toBe(0);
  });

  it("does not leave repeat clones after list shrink and unmount", async () => {
    class LeakRepeatComponent extends AbstractComponent {
      static selector = "leak-repeat-component";

      items$ = this.newRx([{ label: "a" }, { label: "b" }, { label: "c" }]);

      getHTML() {
        return `
          <ul repeat="{{root.items$::rx}}" let-label="{{this.label}}">
            <li class="repeat-item">{{label}}</li>
          </ul>
        `;
      }
    }

    const { instance, list } = mountLeakComponent(LeakRepeatComponent);

    expect(instance.node.querySelectorAll(".repeat-item")).toHaveLength(3);

    instance.items$.update([{ label: "solo" }]);
    await flushMicrotasks();
    expect(instance.node.querySelectorAll(".repeat-item")).toHaveLength(1);

    instance.items$.update([]);
    await flushMicrotasks();
    expect(instance.node.querySelectorAll(".repeat-item")).toHaveLength(0);

    componentsRegistryService.removeComponents(list, true);

    expect(instance.node.querySelectorAll(".repeat-item")).toHaveLength(0);
    expect(countTemplateRxLinks(instance.template)).toBe(0);
  });

  it("does not leak attached section nodes across open/close cycles", async () => {
    class LeakAttachedComponent extends AbstractComponent {
      static selector = "leak-attached-component";

      open$ = this.newRx(false);

      getHTML() {
        return `
          <section attached="{{root.open$::rx}}">
            <p class="attached-body">visible</p>
          </section>
        `;
      }
    }

    const { instance, list } = mountLeakComponent(LeakAttachedComponent);

    for (let i = 0; i < 8; i++) {
      instance.open$.update(true);
      await flushMicrotasks();
      expect(instance.node.querySelectorAll(".attached-body")).toHaveLength(1);

      instance.open$.update(false);
      await flushMicrotasks();
      expect(instance.node.querySelectorAll(".attached-body")).toHaveLength(0);
    }

    componentsRegistryService.removeComponents(list, true);
    expect(instance.node.querySelectorAll(".attached-body")).toHaveLength(0);
    expect(countTemplateRxLinks(instance.template)).toBe(0);
  });
});

describe("lifecycle — router", () => {
  class RouterLeakHomePage extends AbstractComponent {
    static selector = "router-leak-home-page";

    getHTML() {
      return `<p class="router-leak-home">home</p>`;
    }
  }

  class RouterLeakDocsPage extends AbstractComponent {
    static selector = "router-leak-docs-page";

    getHTML() {
      return `<p class="router-leak-docs">docs</p>`;
    }
  }

  function mountRouter() {
    componentsRegistryService.define(RouterLeakHomePage);
    componentsRegistryService.define(RouterLeakDocsPage);
    document.body.innerHTML = `<main id="app"></main>`;

    new RouteUrlBucket({
      home: {
        url: "/",
        componentSelectorUnbox: () => RouterLeakHomePage.selector,
        routeSelectorUnbox: () => "#app",
      },
      docs: {
        url: "/docs/:slug",
        componentSelectorUnbox: () => RouterLeakDocsPage.selector,
        routeSelectorUnbox: () => "#app",
      },
    });
  }

  it("keeps a single mounted page after many route swaps", async () => {
    mountRouter();

    for (let i = 0; i < 10; i++) {
      routerService.pushHistory(i % 2 === 0 ? "/" : "/docs/intro");
      await flushPromises();
    }

    const pages = document.querySelectorAll(
      "router-leak-home-page, router-leak-docs-page",
    );
    expect(pages).toHaveLength(1);

    const rules = (routerService as any).completedComponentRules as Array<{
      components: ComponentsList;
    }>;
    expect(rules).toHaveLength(1);
    expect(rules[0].components).toHaveLength(1);
    expect(rules[0].components[0].destroyed).toBe(false);

    const alive = rules[0].components.filter((c) => !c.destroyed);
    expect(alive).toHaveLength(1);
  });

  it("destroys previous page component on route change", async () => {
    mountRouter();

    routerService.pushHistory("/");
    await flushPromises();

    const rulesAfterHome = (routerService as any).completedComponentRules as Array<{
      components: ComponentsList;
    }>;
    const homeInstance = rulesAfterHome[0].components[0];
    expect(homeInstance.selector).toBe(RouterLeakHomePage.selector);

    routerService.pushHistory("/docs/intro");
    await flushPromises();

    expect(homeInstance.destroyed).toBe(true);

    const rulesAfterDocs = (routerService as any).completedComponentRules as Array<{
      components: ComponentsList;
    }>;
    expect(rulesAfterDocs[0].components).toHaveLength(1);
    expect(rulesAfterDocs[0].components[0].selector).toBe(RouterLeakDocsPage.selector);
    expect(rulesAfterDocs[0].components[0].destroyed).toBe(false);

    expect(countRegistryInstances()).toBeLessThanOrEqual(1);
  });

  it("clears template links when routed page is replaced", async () => {
    class RouterLeakCounterPage extends AbstractComponent {
      static selector = "router-leak-counter-page";

      count$ = this.newRx(0);

      getHTML() {
        return `<span class="router-leak-count">{{root.count$::rx}}</span>`;
      }
    }

    componentsRegistryService.define(RouterLeakCounterPage);
    document.body.innerHTML = `<main id="app"></main>`;

    new RouteUrlBucket({
      a: {
        url: "/a",
        componentSelectorUnbox: () => RouterLeakCounterPage.selector,
        routeSelectorUnbox: () => "#app",
      },
      b: {
        url: "/b",
        componentSelectorUnbox: () => RouterLeakHomePage.selector,
        routeSelectorUnbox: () => "#app",
      },
    });

    routerService.pushHistory("/a");
    await flushPromises();

    const rulesA = (routerService as any).completedComponentRules as Array<{
      components: ComponentsList;
    }>;
    const counterPage = rulesA[0].components[0] as RouterLeakCounterPage;
    counterPage.count$.update(5);
    await flushMicrotasks();

    expect(countTemplateRxLinks(counterPage.template)).toBeGreaterThan(0);
    expect(countPostUpdateListeners(counterPage.count$)).toBeGreaterThan(0);

    routerService.pushHistory("/b");
    await flushPromises();

    expect(counterPage.destroyed).toBe(true);
    expect(countTemplateRxLinks(counterPage.template)).toBe(0);
    expect(countPostUpdateListeners(counterPage.count$)).toBe(0);
  });
});
