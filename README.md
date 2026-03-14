# Cruzo

**Zero-dependency reactive UI framework with a custom expression VM.**

Build fast, small frontends with HTML templates, reactive state, and a bytecode VM — no runtime dependencies, no virtual DOM.

[![npm version](https://img.shields.io/npm/v/cruzo.svg)](https://www.npmjs.com/package/cruzo) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

---

## Features

| | |
|---|---|
| **No dependencies** | Ship only your code. |
| **Expression VM** | Templates use `{{ }}` expressions compiled to bytecode and executed in a tiny stack VM. |
| **Reactive primitives** | `Rx` and `RxFunc` for reactive values and derived state; updates propagate to the DOM. |
| **Scoped state** | `RxScope` for named, indexable state buckets shared across components. |
| **Component model** | `AbstractComponent` + registry; components have `selector`, config, and scope. |
| **Router** | Declarative routes, params, redirects, and lifecycle hooks. |
| **HTTP client** | Configurable `HttpClient` with cache, interceptors, and AbortSignal support. |
| **Optional UI pack** | Input, Select, ButtonGroup, Upload, RouterLink in `cruzo/ui-components`. |

---

## Install

```bash
npm install cruzo
```

---

## Examples

See **cruzo-starter** for the full demo app. Below: short intro examples, then full template syntax, Router and HTTP.

### 1. Ordinary template

```ts
import { AbstractComponent, componentsRegistryService } from "cruzo";

export class DemoTemplateSimpleComponent extends AbstractComponent {
  static selector = "demo-template-simple-component";

  name = "World";

  getHTML() {
    return `<div>Hello, <b>{{ root.name }}</b></div>`;
  }
}
componentsRegistryService.define(DemoTemplateSimpleComponent);
```

### 2. Template with Rx

`::rx` subscribes the node to a reactive value; DOM updates when Rx updates.

```ts
import { AbstractComponent, componentsRegistryService } from "cruzo";

export class DemoTemplateRxComponent extends AbstractComponent {
  static selector = "demo-template-rx-component";

  count$ = this.newRx(0);

  getHTML() {
    return `<div>
  <button onclick="root.count$.update(root.count$::rx + 1)" class="btn btn_s mb_s btn-primary">
    Clicks: <b>{{ root.count$::rx }}</b>
  </button>
</div>`;
  }
}
componentsRegistryService.define(DemoTemplateRxComponent);
```

### 3. RxFunc — derived state

`newRxFunc(fn, ...deps)` creates a reactive value that recomputes when any dependency changes. You can pass multiple dependencies; same `::rx` in the template.

```ts
import { AbstractComponent, componentsRegistryService } from "cruzo";

export class DemoTemplateRxFuncComponent extends AbstractComponent {
  static selector = "demo-template-rxfunc-component";

  count$ = this.newRx(0);
  factor$ = this.newRx(2);
  product$ = this.newRxFunc((c, f) => c * f, this.count$, this.factor$);

  getHTML() {
    return `<div>
  <button onclick="root.count$.update(root.count$::rx + 1)" class="btn btn_s mb_s btn-primary">count +1</button>
  <button onclick="root.factor$.update(root.factor$::rx + 1)" class="btn btn_s mb_s btn-primary ml_s">factor +1</button>
  <div class="mt_s">count: <b>{{ root.count$::rx }}</b> · factor: <b>{{ root.factor$::rx }}</b> → product: <b>{{ root.product$::rx }}</b></div>
</div>`;
  }
}
componentsRegistryService.define(DemoTemplateRxFuncComponent);
```

### 4. Template: repeat, attached, once::, let-*, events, ::rx

One component — lists, conditional DOM, one-time eval, local vars, native events.

```ts
import { AbstractComponent, componentsRegistryService } from "cruzo";

export class DemoComponent extends AbstractComponent {
  static selector = "demo-component";

  items$ = [
    this.newRx({ id: 1, name: "Apple", tags: ["fruit", "red"] }),
    this.newRx({ id: 2, name: "Banana", tags: ["fruit", "yellow"] }),
  ];
  open$ = this.newRx(true);
  selected$ = this.newRx<number>(null);
  label$ = this.newRx("initial");
  text$ = this.newRx("");

  getHTML() {
    return `<div>
  <input value="{{ root.text$::rx }}" oninput="root.text$.update(event.target.value)" />
  <span>{{ root.text$::rx }}</span>

  <button onclick="root.label$.update('updated')">Update</button>
  <span>once: {{ once::root.label$::rx }}</span> · <span>live: {{ root.label$::rx }}</span>

  <button onclick="root.open$.update(!root.open$::rx)">Toggle</button>
  <div attached="root.open$::rx">In DOM only when open</div>

  <div repeat="root.items$" onclick="root.selected$.update(this::rx.id)"
       let-full="this::rx.name + ' (' + (this::rx.tags.join(', ')) + ')'">
    #{{ index }} {{ this::rx.name }}
    <div repeat="this::rx.tags">{{ index }}: {{ this }}</div>
    full: {{ full }}
  </div>
  selected: {{ root.selected$::rx }}
</div>`;
  }
}
componentsRegistryService.define(DemoComponent);
```

### 5. Template: let-*, methods, ?., ??, shorthand, inner-html

Expressions in `{{ }}`: component methods, optional chaining, nullish coalescing, object shorthand.

```ts
export class DemoExpressionsComponent extends AbstractComponent {
  static selector = "demo-expressions-component";

  user$ = this.newRx({
    name: "John",
    tags: ["admin", "editor"],
    meta: { lastLogin: Date.now() },
  });
  html$ = this.newRx("<b>bold</b>");

  upperTags(tags: string[]) {
    return tags?.map((t) => t.toUpperCase()).join(", ") ?? "-";
  }
  formatDate(ts: number | undefined) {
    return ts ? new Date(ts).toLocaleString() : "-";
  }

  getHTML() {
    return `<div let-name="root.user$::rx.name" let-tags="root.user$::rx.tags">
  {{ root.user$::rx.name ?? "Anonymous" }} ·
  {{ root.upperTags(root.user$::rx.tags) }} ·
  {{ root.formatDate(root.user$::rx.meta?.lastLogin) }} ·
  {{ root.isAdmin?.(root.user$::rx.tags) ? "admin" : "user" }} ·
  shorthand: {{ ({ name, tags }).name }}
  <span inner-html="root.html$::rx"></span>
</div>`;
  }
  isAdmin(tags: string[] | undefined) {
    return tags?.includes("admin") ?? false;
  }
}
```

### 6. RxScope + child components

One scope, several components; parent subscribes via `newRxValueFromScope`.

```ts
import { AbstractComponent, RxScope } from "cruzo";
import { InputComponent, ButtonGroupComponent, InputConfig, ButtonGroupConfig } from "cruzo/ui-components";

export class DemoScopeComponent extends AbstractComponent {
  static selector = "demo-scope-component";
  dependencies = new Set([InputComponent.selector, ButtonGroupComponent.selector]);

  innerScope = new RxScope({
    input: { config: InputConfig({ label: "Name" }) },
    buttonGroup: { config: ButtonGroupConfig({ items: [{ label: "A", value: "a" }, { label: "B", value: "b" }] }) },
  });
  inputValue$ = this.newRxValueFromScope(this.innerScope, "input");
  choice$ = this.newRxValueFromScope(this.innerScope, "buttonGroup");

  getHTML() {
    return `<div>
      <input-component component-id="input" scope-id="${this.innerScope.id}"></input-component>
      <button-group-component component-id="buttonGroup" scope-id="${this.innerScope.id}"></button-group-component>
      Input: {{ root.inputValue$::rx }} · Choice: {{ root.choice$::rx }}
    </div>`;
  }
}
```

### Bootstrap

```ts
import { componentsRegistryService } from "cruzo";

componentsRegistryService.initApp();
```

### Router

```ts
import { RouteUrlBucket } from "cruzo";

const routerUrlBucket = new RouteUrlBucket({
  main: { url: "/", componentSelectorUnbox: () => HomeComponent.selector, routeSelectorUnbox: () => ".section" },
  docs: { url: "/docs/:section", componentSelectorUnbox: () => DocsSectionComponent.selector, routeSelectorUnbox: () => ".section" },
});
routerUrlBucket.buildUrl("main");
routerUrlBucket.buildUrl("docs", { section: "template-engine" });
```

### HTTP: interceptors and cache

```ts
import { HttpClient } from "cruzo";

const client = new HttpClient("https://api.example.com", {
  params: async (method, url, options) => {
    options.headers = options.headers || {};
    options.headers["Authorization"] = "Bearer " + getToken();
  },
  error: async (method, url, options, status) => {
    if (status === 401) { /* logout */ }
  },
});

const cached = new HttpClient("https://api.example.com", {}, false, 60_000);
await cached.get("/users");
await cached.clearCache("GET", "/users");
```

## UI components (optional)

```ts
import {
  InputComponent,
  SelectComponent,
  ButtonGroupComponent,
  UploadComponent,
  RouterLinkComponent,
} from "cruzo/ui-components";
```

Register with **`componentsRegistryService.define(Component)`**. They use the same scope/config model; set **`scope-id`** and **`component-id`** on the element so the scope can route config and value.

### CSS modules in your components

Use **`*.module.css`** in any component: import the default and use the object in class names.

```ts
import styles from "./my.component.module.css";

getHTML() {
  return `<div class="${styles.wrapper}"><span class="${styles.label}">...</span></div>`;
}
```

The package ships a TypeScript declaration for `*.module.css`; in your app ensure the bundler is set up for CSS modules (Vite does this by default). Build uses `camelCase` for class names and scoped names like `[name]__[local]___[hash:base64:5]`.

---

## License

MIT
