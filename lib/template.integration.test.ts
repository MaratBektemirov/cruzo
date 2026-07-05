import { afterEach, describe, expect, it } from "vitest";
import { AbstractComponent } from "./component";
import { componentsRegistryService } from "./components-registry.service";
import type { ComponentsList } from "./types/interfaces";

async function flushMicrotasks() {
  await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
}

function mountComponent<T extends AbstractComponent>(
  Cls: AbstractComponentConstructor<T>,
): T {
  componentsRegistryService.define(Cls);

  const node = document.createElement(Cls.selector);
  document.body.appendChild(node);

  const list: ComponentsList = [];
  componentsRegistryService.connectBySelector(Cls.selector, list, document.body);

  const instance = list[0];
  if (!instance) throw new Error(`Failed to mount ${Cls.selector}`);

  return instance as T;
}

type AbstractComponentConstructor<T extends AbstractComponent = AbstractComponent> = {
  new (): T;
  selector: string;
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Template + VM integration", () => {
  it("updates text node when Rx changes (linkRxToTemplate)", async () => {
    class CounterComponent extends AbstractComponent {
      static selector = "counter-component";

      count$ = this.newRx(0);

      inc() {
        this.count$.update(this.count$.actual + 1);
      }

      getHTML() {
        return `
          <button type="button" onclick="{{root.inc()}}">
            <span data-testid="val">{{root.count$::rx}}</span>
          </button>
        `;
      }
    }

    const comp = mountComponent(CounterComponent);
    const val = comp.node.querySelector('[data-testid="val"]');

    expect(val?.textContent).toBe("0");

    comp.count$.update(5);
    await flushMicrotasks();

    expect(val?.textContent).toBe("5");
  });

  it("runs onclick handler compiled by VM", async () => {
    class CounterComponent extends AbstractComponent {
      static selector = "counter-click-component";

      count$ = this.newRx(0);

      inc() {
        this.count$.update(this.count$.actual + 1);
      }

      getHTML() {
        return `
          <button type="button" onclick="{{root.inc()}}">
            <span data-testid="val">{{root.count$::rx}}</span>
          </button>
        `;
      }
    }

    const comp = mountComponent(CounterComponent);
    const button = comp.node.querySelector("button")!;

    button.click();
    await flushMicrotasks();

    expect(comp.count$.actual).toBe(1);
    expect(comp.node.querySelector('[data-testid="val"]')?.textContent).toBe("1");
  });

  it("renders repeat clones from Rx list", async () => {
    class ListComponent extends AbstractComponent {
      static selector = "list-component";

      items$ = this.newRx([{ label: "alpha" }, { label: "beta" }]);

      getHTML() {
        return `
          <ul repeat="{{root.items$::rx}}" let-label="{{this.label}}">
            <li class="item">{{label}}</li>
          </ul>
        `;
      }
    }

    const comp = mountComponent(ListComponent);

    expect(comp.node.querySelectorAll(".item")).toHaveLength(2);
    expect(comp.node.textContent).toContain("alpha");
    expect(comp.node.textContent).toContain("beta");

    comp.items$.update([{ label: "solo" }]);
    await flushMicrotasks();

    expect(comp.node.querySelectorAll(".item")).toHaveLength(1);
    expect(comp.node.textContent).toContain("solo");
  });

  it("throws when ::rx is applied to a non-Rx repeat item", () => {
    class BadListComponent extends AbstractComponent {
      static selector = "bad-list-component";

      items$ = this.newRx([{ label: "alpha" }]);

      getHTML() {
        return `
          <ul repeat="{{root.items$::rx}}" let-label="{{this::rx.label}}">
            <li>{{label}}</li>
          </ul>
        `;
      }
    }

    expect(() => mountComponent(BadListComponent)).toThrow(/::rx is only for Rx values/);
  });

  it("mounts and unmounts node with attached expression", async () => {
    class PanelComponent extends AbstractComponent {
      static selector = "panel-component";

      open$ = this.newRx(false);

      getHTML() {
        return `
          <section attached="{{root.open$::rx}}">
            <p class="body">visible</p>
          </section>
        `;
      }
    }

    const comp = mountComponent(PanelComponent);

    expect(comp.node.querySelector(".body")).toBeNull();

    comp.open$.update(true);
    await flushMicrotasks();

    expect(comp.node.querySelector(".body")?.textContent).toBe("visible");

    comp.open$.update(false);
    await flushMicrotasks();

    expect(comp.node.querySelector(".body")).toBeNull();
  });

  it("reconnects nested components when reactive inner-html changes", async () => {
    class InnerHtmlChildComponent extends AbstractComponent {
      static selector = "inner-html-child-component";

      label$ = this.newRx("v1");
      disconnected = false;

      getHTML() {
        return `<span class="inner-label">{{root.label$::rx}}</span>`;
      }

      disconnectedCallback(removeFromDom = false) {
        this.disconnected = true;
        super.disconnectedCallback(removeFromDom);
      }
    }

    class InnerHtmlHostComponent extends AbstractComponent {
      static selector = "inner-html-host-component";

      dependencies = new Set(["inner-html-child-component"]);

      body$ = this.newRx("<inner-html-child-component></inner-html-child-component>");

      getHTML() {
        return `<div class="body-host" inner-html="{{root.body$::rx}}"></div>`;
      }
    }

    componentsRegistryService.define(InnerHtmlChildComponent);
    const host = mountComponent(InnerHtmlHostComponent);

    const firstChild = host.connectedDependencies?.[0] as InnerHtmlChildComponent | undefined;
    expect(firstChild?.label$).toBeDefined();
    expect(host.node.querySelector(".inner-label")?.textContent).toBe("v1");
    expect(firstChild?.disconnected).toBe(false);

    host.body$.update("<span class=\"plain\">text</span>");
    await flushMicrotasks();

    expect(firstChild?.disconnected).toBe(true);
    expect(host.node.querySelector(".inner-label")).toBeNull();
    expect(host.node.querySelector(".plain")?.textContent).toBe("text");

    host.body$.update("<inner-html-child-component></inner-html-child-component>");
    await flushMicrotasks();

    const secondChild = host.connectedDependencies?.[0] as InnerHtmlChildComponent | undefined;
    expect(secondChild).toBeDefined();
    expect(secondChild).not.toBe(firstChild);
    expect(secondChild?.disconnected).toBe(false);
    expect(host.node.querySelector(".inner-label")?.textContent).toBe("v1");
  });
});
