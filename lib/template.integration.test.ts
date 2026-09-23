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

  it("reconciles repeat clones by object reference on middle delete", async () => {
    const a = { label: "a", id: "a" };
    const b = { label: "b", id: "b" };
    const c = { label: "c", id: "c" };

    class ListComponent extends AbstractComponent {
      static selector = "ref-repeat-delete-component";

      items$ = this.newRx([a, b, c]);

      getHTML() {
        return `
          <ul repeat="{{root.items$::rx}}" let-label="{{this.label}}" let-id="{{this.id}}">
            <li class="item" data-id="{{id}}">{{label}}</li>
          </ul>
        `;
      }
    }

    const comp = mountComponent(ListComponent);
    const nodesBefore = [...comp.node.querySelectorAll(".item")];

    const items = comp.items$.actual;
    items.splice(1, 1);
    comp.items$.update(items);
    await flushMicrotasks();

    expect(comp.node.querySelectorAll(".item")).toHaveLength(2);
    expect(comp.node.querySelector('[data-id="a"]')).toBe(nodesBefore[0]);
    expect(comp.node.querySelector('[data-id="c"]')).toBe(nodesBefore[2]);
    expect(comp.node.querySelector('[data-id="b"]')).toBeNull();
  });

  it("reconciles repeat clones by object reference on insert and reorder", async () => {
    const a = { label: "a", id: "a" };
    const c = { label: "c", id: "c" };

    class ListComponent extends AbstractComponent {
      static selector = "ref-repeat-insert-component";

      items$ = this.newRx([a, c]);

      getHTML() {
        return `
          <ul repeat="{{root.items$::rx}}" let-label="{{this.label}}" let-id="{{this.id}}">
            <li class="item" data-id="{{id}}">{{label}}</li>
          </ul>
        `;
      }
    }

    const comp = mountComponent(ListComponent);
    const nodeA = comp.node.querySelector('[data-id="a"]')!;
    const nodeC = comp.node.querySelector('[data-id="c"]')!;

    const b = { label: "b", id: "b" };
    comp.items$.update([a, b, c]);
    await flushMicrotasks();

    expect(comp.node.querySelectorAll(".item")).toHaveLength(3);
    expect(comp.node.querySelector('[data-id="a"]')).toBe(nodeA);
    expect(comp.node.querySelector('[data-id="c"]')).toBe(nodeC);

    comp.items$.update([c, a]);
    await flushMicrotasks();

    const items = [...comp.node.querySelectorAll(".item")];
    expect(items).toHaveLength(2);
    expect(items[0]).toBe(nodeC);
    expect(items[1]).toBe(nodeA);
  });

  it("rebuilds all repeat clones when array items are replaced with new objects", async () => {
    const a = { label: "a" };
    const b = { label: "b" };

    class ListComponent extends AbstractComponent {
      static selector = "ref-repeat-spread-component";

      items$ = this.newRx([a, b]);

      getHTML() {
        return `
          <ul repeat="{{root.items$::rx}}" let-label="{{this.label}}">
            <li class="item">{{label}}</li>
          </ul>
        `;
      }
    }

    const comp = mountComponent(ListComponent);
    const nodesBefore = [...comp.node.querySelectorAll(".item")];

    comp.items$.update([{ label: "a" }, { label: "b" }]);
    await flushMicrotasks();

    const nodesAfter = [...comp.node.querySelectorAll(".item")];
    expect(nodesAfter).toHaveLength(2);
    expect(nodesAfter[0]).not.toBe(nodesBefore[0]);
    expect(nodesAfter[1]).not.toBe(nodesBefore[1]);
  });

  it("preserves keyed repeat clones when items are replaced with new objects", async () => {
    class ListComponent extends AbstractComponent {
      static selector = "key-repeat-preserve-component";

      items$ = this.newRx([
        { id: 1, label: "A" },
        { id: 2, label: "B" },
      ]);

      getHTML() {
        return `
          <ul repeat="{{root.items$::rx}}" repeat-key="{{this.id}}" let-label="{{this.label}}" let-id="{{this.id}}">
            <li class="item" data-id="{{id}}">{{label}}</li>
          </ul>
        `;
      }
    }

    const comp = mountComponent(ListComponent);
    const nodesBefore = [...comp.node.querySelectorAll(".item")];

    comp.items$.update([
      { id: 1, label: "A updated" },
      { id: 2, label: "B updated" },
    ]);
    await flushMicrotasks();

    const nodesAfter = [...comp.node.querySelectorAll(".item")];
    expect(nodesAfter).toHaveLength(2);
    expect(nodesAfter[0]).toBe(nodesBefore[0]);
    expect(nodesAfter[1]).toBe(nodesBefore[1]);
    expect(nodesAfter[0].textContent).toBe("A updated");
    expect(nodesAfter[1].textContent).toBe("B updated");
  });

  it("preserves nested component instances across keyed JSON refreshes", async () => {
    const children: AbstractComponent[] = [];

    class KeyedChildComponent extends AbstractComponent {
      static selector = "keyed-repeat-child-component";

      constructor() {
        super();
        children.push(this);
      }

      getHTML() {
        return "<span>child</span>";
      }
    }

    class ListComponent extends AbstractComponent {
      static selector = "key-repeat-child-host-component";

      dependencies = new Set([KeyedChildComponent.selector]);
      items$ = this.newRx([{ id: 1 }, { id: 2 }]);

      getHTML() {
        return `
          <keyed-repeat-child-component
            repeat="{{root.items$::rx}}"
            repeat-key="{{this.id}}"
            data-id="{{this.id}}">
          </keyed-repeat-child-component>
        `;
      }
    }

    componentsRegistryService.define(KeyedChildComponent);
    const comp = mountComponent(ListComponent);
    const instancesBefore = [...children];
    const nodesBefore = instancesBefore.map((child) => child.node);

    comp.items$.update([{ id: 1 }, { id: 2 }]);
    await flushMicrotasks();

    expect(children).toHaveLength(2);
    expect(children[0]).toBe(instancesBefore[0]);
    expect(children[1]).toBe(instancesBefore[1]);
    expect(children[0].node).toBe(nodesBefore[0]);
    expect(children[1].node).toBe(nodesBefore[1]);
  });

  it("reorders keyed repeat clones without remounting", async () => {
    class ListComponent extends AbstractComponent {
      static selector = "key-repeat-reorder-component";

      items$ = this.newRx([
        { id: "a", label: "a" },
        { id: "b", label: "b" },
      ]);

      getHTML() {
        return `
          <ul repeat="{{root.items$::rx}}" repeat-key="{{this.id}}" let-label="{{this.label}}" let-id="{{this.id}}">
            <li class="item" data-id="{{id}}">{{label}}</li>
          </ul>
        `;
      }
    }

    const comp = mountComponent(ListComponent);
    const nodeA = comp.node.querySelector('[data-id="a"]')!;
    const nodeB = comp.node.querySelector('[data-id="b"]')!;

    comp.items$.update([
      { id: "b", label: "b" },
      { id: "a", label: "a" },
    ]);
    await flushMicrotasks();

    const items = [...comp.node.querySelectorAll(".item")];
    expect(items).toHaveLength(2);
    expect(items[0]).toBe(nodeB);
    expect(items[1]).toBe(nodeA);
  });

  it("mounts and unmounts only affected keyed repeat clones", async () => {
    class ListComponent extends AbstractComponent {
      static selector = "key-repeat-patch-component";

      items$ = this.newRx([
        { id: "a", label: "a" },
        { id: "b", label: "b" },
      ]);

      getHTML() {
        return `
          <ul repeat="{{root.items$::rx}}" repeat-key="{{this.id}}" let-label="{{this.label}}" let-id="{{this.id}}">
            <li class="item" data-id="{{id}}">{{label}}</li>
          </ul>
        `;
      }
    }

    const comp = mountComponent(ListComponent);
    const nodeA = comp.node.querySelector('[data-id="a"]')!;

    comp.items$.update([
      { id: "a", label: "a" },
      { id: "c", label: "c" },
    ]);
    await flushMicrotasks();

    expect(comp.node.querySelector('[data-id="a"]')).toBe(nodeA);
    expect(comp.node.querySelector('[data-id="b"]')).toBeNull();
    expect(comp.node.querySelector('[data-id="c"]')?.textContent).toBe("c");
  });

  it("throws on duplicate repeat-key values", () => {
    class ListComponent extends AbstractComponent {
      static selector = "key-repeat-dup-component";

      items$ = this.newRx([
        { id: "x", label: "one" },
        { id: "x", label: "two" },
      ]);

      getHTML() {
        return `
          <ul repeat="{{root.items$::rx}}" repeat-key="{{this.id}}" let-label="{{this.label}}">
            <li class="item">{{label}}</li>
          </ul>
        `;
      }
    }

    expect(() => mountComponent(ListComponent)).toThrow(/duplicate repeat-key: "x"/);
  });

  it("throws on null or undefined repeat-key values", () => {
    class ListComponent extends AbstractComponent {
      static selector = "key-repeat-missing-component";

      items$ = this.newRx([{ id: null }, {}]);

      getHTML() {
        return `
          <ul repeat="{{root.items$::rx}}" repeat-key="{{this.id}}">
            <li class="item"></li>
          </ul>
        `;
      }
    }

    expect(() => mountComponent(ListComponent)).toThrow(
      /repeat-key must not be null or undefined/,
    );
  });

  it("updates repeat clone content when item object is mutated in place", async () => {
    const a = { label: "before" };

    class ListComponent extends AbstractComponent {
      static selector = "ref-repeat-mutate-component";

      items$ = this.newRx([a]);

      getHTML() {
        return `
          <ul repeat="{{root.items$::rx}}" let-label="{{this.label}}">
            <li class="item">{{label}}</li>
          </ul>
        `;
      }
    }

    const comp = mountComponent(ListComponent);
    const node = comp.node.querySelector(".item")!;

    a.label = "after";
    comp.items$.update(comp.items$.actual);
    await flushMicrotasks();

    expect(node.textContent).toBe("after");
    expect(comp.node.querySelector(".item")).toBe(node);
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
