import { afterEach, describe, expect, it, vi } from "vitest";
import { AbstractComponent } from "./component";
import { componentsRegistryService, clearRegistryInstancesForTests } from "./components-registry.service";
import { RxBucket } from "./rx-bucket";
import type { ComponentsList } from "./types/interfaces";
import { Rx } from "./rx";

type ComponentConstructor = {
  new (): AbstractComponent;
  selector: string;
};

function resetRegistry() {
  componentsRegistryService.componentsRoot.length = 0;
  componentsRegistryService.listBySelector.clear();
  componentsRegistryService.buckets = {};
  clearRegistryInstancesForTests();
  document.body.innerHTML = "";
}

class RegistryTestComponent extends AbstractComponent {
  static selector = "registry-test-component";

  getHTML() {
    return `<p class="registry-test">{{root.label$::rx}}</p>`;
  }

  label$ = this.newRx("ok");
}

class RegistryOtherComponent extends AbstractComponent {
  static selector = "registry-other-component";

  getHTML() {
    return `<span class="registry-other">other</span>`;
  }
}

class RegistryBucketChildComponent extends AbstractComponent {
  static selector = "registry-bucket-child";
  hasOuterBucket = true;

  getHTML() {
    return `<span class="registry-bucket-child">{{root.value$::rx}}</span>`;
  }
}

afterEach(() => {
  resetRegistry();
});

describe("componentsRegistryService.define", () => {
  it("registers component constructor by selector", () => {
    componentsRegistryService.define(RegistryTestComponent);

    expect(componentsRegistryService.listBySelector.get("registry-test-component")).toBe(
      RegistryTestComponent,
    );
  });

  it("warns when selector is redefined", () => {
    class RegistryDupA extends AbstractComponent {
      static selector = "registry-dup-component";
      getHTML() {
        return "";
      }
    }
    class RegistryDupB extends AbstractComponent {
      static selector = "registry-dup-component";
      getHTML() {
        return "";
      }
    }

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    componentsRegistryService.define(RegistryDupA);
    componentsRegistryService.define(RegistryDupB);

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Component "registry-dup-component" is already defined'),
    );
  });
});

describe("componentsRegistryService.connectBySelector", () => {
  it("connects defined component instances from DOM nodes", () => {
    componentsRegistryService.define(RegistryTestComponent);

    const node = document.createElement("registry-test-component");
    document.body.appendChild(node);

    const list: ComponentsList = [];
    const connected = componentsRegistryService.connectBySelector(
      RegistryTestComponent.selector,
      list,
      document.body,
    );

    expect(connected).toHaveLength(1);
    expect(list).toHaveLength(1);
    expect(list[0].node).toBe(node);
    expect(list[0].destroyed).toBe(false);
    expect(node.querySelector(".registry-test")?.textContent).toBe("ok");
  });

  it("throws when component is not defined", () => {
    document.body.innerHTML = "<registry-test-component></registry-test-component>";

    expect(() =>
      componentsRegistryService.connectBySelector("registry-test-component", []),
    ).toThrow(/not defined/);
  });

  it("reuses existing instance for the same node", () => {
    componentsRegistryService.define(RegistryTestComponent);

    const node = document.createElement("registry-test-component");
    document.body.appendChild(node);

    const list: ComponentsList = [];
    componentsRegistryService.connectBySelector(RegistryTestComponent.selector, list, document.body);
    componentsRegistryService.connectBySelector(RegistryTestComponent.selector, list, document.body);

    expect(list).toHaveLength(1);
  });

  it("passes route params and http factory from rule", () => {
    class RegistryRouteComponent extends AbstractComponent {
      static selector = "registry-route-component";

      getHTML() {
        return `<i></i>`;
      }
    }

    componentsRegistryService.define(RegistryRouteComponent);

    const node = document.createElement("registry-route-component");
    document.body.appendChild(node);

    const params$ = new Rx([], (v) => v, { id: 7 });
    const httpFactory = {
      api: (_signal: AbortSignal) => ({ get: vi.fn() }) as any,
    };

    const list: ComponentsList = [];
    componentsRegistryService.connectBySelector(
      RegistryRouteComponent.selector,
      list,
      document.body,
      {
        url: null as any,
        componentSelector: RegistryRouteComponent.selector,
        routeSelector: "#app",
        params$,
        httpFactory,
        components: list,
      },
    );

    expect(list[0].http?.api).toBeDefined();
    expect(list[0].routeParams$).toBe(params$);
  });
});

describe("componentsRegistryService.removeComponents", () => {
  it("disconnects instances and optionally removes nodes", () => {
    componentsRegistryService.define(RegistryTestComponent);

    const node = document.createElement("registry-test-component");
    document.body.appendChild(node);

    const list: ComponentsList = [];
    componentsRegistryService.connectBySelector(RegistryTestComponent.selector, list, document.body);

    componentsRegistryService.removeComponents(list, true);

    expect(list).toHaveLength(0);
    expect(document.body.contains(node)).toBe(false);
  });
});

describe("componentsRegistryService.initApp", () => {
  it("connects all defined selectors found in document", () => {
    componentsRegistryService.define(RegistryTestComponent);
    componentsRegistryService.define(RegistryOtherComponent);

    document.body.innerHTML = `
      <registry-test-component></registry-test-component>
      <registry-other-component></registry-other-component>
    `;

    componentsRegistryService.initApp();

    expect(componentsRegistryService.componentsRoot).toHaveLength(2);
    expect(document.querySelector(".registry-test")?.textContent).toBe("ok");
    expect(document.querySelector(".registry-other")?.textContent).toBe("other");
  });
});

describe("componentsRegistryService bucket registry", () => {
  it("connectBucket and disconnectBucket track buckets by id", () => {
    const bucket = new RxBucket({
      child: { config: { label: "x" } },
    });

    componentsRegistryService.connectBucket(bucket);
    expect(componentsRegistryService.buckets[bucket.id]).toBe(bucket);

    componentsRegistryService.disconnectBucket(bucket);
    expect(componentsRegistryService.buckets[bucket.id]).toBeUndefined();
  });

  it("resolves outer bucket for connected child component", () => {
    componentsRegistryService.define(RegistryBucketChildComponent);

    const bucket = new RxBucket({
      child: { config: { label: "child" } },
    });
    componentsRegistryService.connectBucket(bucket);

    const node = document.createElement("registry-bucket-child");
    node.setAttribute("component-id", "child");
    node.setAttribute("bucket-id", String(bucket.id));
    document.body.appendChild(node);

    bucket.setValue("child", "wired");

    const list: ComponentsList = [];
    componentsRegistryService.connectBySelector(RegistryBucketChildComponent.selector, list, document.body);

    expect(list[0].outerBucket).toBe(bucket);
    expect(node.querySelector(".registry-bucket-child")?.textContent).toBe("wired");
  });
});
