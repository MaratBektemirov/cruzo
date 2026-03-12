# C R U Z O

<img src="./assets/cruzo.png" alt="cruzo" width="100" height="100" />

> zero-dependency reactive framework + expression VM  
> no vdom. no magic build step. just html + rx + bytecode.

[![npm version](https://img.shields.io/npm/v/cruzo.svg)](https://www.npmjs.com/package/cruzo)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

---

## // What Is This

`cruzo` is a tiny UI framework with:

- reactive primitives (`newRx`, `newRxFunc`) inside components
- template engine with `{{ }}` expressions compiled to bytecode VM
- scoped data bus via `RxScope`
- built-in router (`RouteUrlBucket`, `routerService`)
- built-in HTTP client (`HttpClient`) with interceptors, cache, abort
- optional UI components as separate entrypoints

If you want full control over DOM and a small runtime footprint, this is your lane.

---

## // Install

```bash
npm i cruzo
```

---

## // Public API (current)

Root import:

```ts
import {
  Template,
  AbstractComponent,
  AbstractService,
  RxScope,
  componentsRegistryService,
  routerService,
  RouteUrlBucket,
  HttpClient,
  HttpError,
  delay,
  debounce,
  arrayToHash,
} from "cruzo";
```

Also available via dedicated subpath:

```ts
import { delay, debounce, arrayToHash } from "cruzo/utils";
```

Also exported types:

```ts
import type {
  HttpRequestOptions,
  Interceptors,
  AbstractComponentConstructor,
  ComponentDescriptor,
  ComponentConnectedParams,
  ScopeEvent,
  Rx,
  RxFunc,
} from "cruzo";
```

---

## // Fast Start

```ts
import { AbstractComponent, componentsRegistryService } from "cruzo";

class CounterComponent extends AbstractComponent {
  static selector = "counter-component";

  count$ = this.newRx(0);

  getHTML() {
    return `
      <button onclick="{{root.count$.update(root.count$::rx + 1)}}">
        ping: {{root.count$::rx}}
      </button>
    `;
  }
}

componentsRegistryService.define(CounterComponent);
componentsRegistryService.initApp();
```

Place `<counter-component></counter-component>` in HTML and it works.

---

## // Template Syntax Cheatsheet

Supported in templates:

- text interpolation: `{{ expr }}`
- events: `onclick="{{ root.doStuff() }}"`
- reactive read: `rxValue$::rx`
- one-time evaluation: `once::expr`
- loop: `repeat="{{ root.list$::rx }}"`
- conditional mount: `attached="{{ root.flag$::rx }}"`
- lexical vars: `let-item="{{ this::rx }}"`
- raw html: `inner-html="{{ root.html$::rx }}"`

Example:

```html
<div repeat="{{root.items$::rx}}" let-name="{{this::rx.name}}">
  <button onclick="{{root.select(this::rx.id)}}">{{name}}</button>
</div>

<section attached="{{root.open$::rx}}">
  selected: {{root.selected$::rx ?? "none"}}
</section>
```

---

## // RxScope: shared config/state/value/events

```ts
import { AbstractComponent, RxScope } from "cruzo";

type ScopeShape = {
  input: { config: { placeholder: string } };
};

class DemoScopeComponent extends AbstractComponent {
  static selector = "demo-scope-component";

  innerScope = new RxScope<ScopeShape>({
    input: { config: { placeholder: "your alias" } },
  });

  inputValue$ = this.newRxValueFromScope(this.innerScope, "input");

  getHTML() {
    return `
      <input-component component-id="input" scope-id="${this.innerScope.id}"></input-component>
      <pre>{{root.inputValue$::rx}}</pre>
    `;
  }
}
```

Use `scope-id` + `component-id` to route descriptor/config/value into components.

---

## // Router

```ts
import { RouteUrlBucket } from "cruzo";

const routes = new RouteUrlBucket({
  home: {
    url: "/",
    componentSelectorUnbox: () => "home-page",
    routeSelectorUnbox: () => "#app",
  },
  docs: {
    url: "/docs/:slug",
    componentSelectorUnbox: () => "docs-page",
    routeSelectorUnbox: () => "#app",
  },
  oldDocs: {
    url: "/guide/*rest",
    redirectTo: "/docs/intro",
  },
});

routes.buildUrl("docs", { slug: "template-vm" }); // /docs/template-vm
```

`routerService` also provides:

- `pushHistory(href)`
- `pushHistoryLink(event, href)`
- `hrefIsActive(href, { startsWith, ignoreSearch, ignoreHash })`
- reactive URL streams: `pathname$`, `search$`, `hash$`

---

## // HTTP

```ts
import { HttpClient } from "cruzo";

const api = new HttpClient("https://api.example.com", {
  params: async (_method, _url, options) => {
    options.headers ??= {};
    options.headers.Authorization = "Bearer " + token();
  },
  error: async (_method, _url, _options, status) => {
    if (status === 401) logout();
  },
}, false, 30_000);

const me = await api.get("/me", { useCache: true });
await api.clearCache("GET", "/me");
```

Features:

- auto `content-type` inference
- JSON/text/form-urlencoded body normalization
- AbortSignal support (`factory(signal)`)
- in-memory request cache (`cacheTime` + `useCache`)

---

## // UI Components (separate imports)

`cruzo` now exposes UI components via dedicated subpaths:

```ts
import { InputComponent, InputConfig } from "cruzo/ui-components/input";
import { ButtonGroupComponent, ButtonGroupConfig } from "cruzo/ui-components/button-group";
import { SelectComponent, SelectConfig } from "cruzo/ui-components/select";
import { RouterLinkComponent, RouterLinkConfig } from "cruzo/ui-components/router-link";
import { SpinnerComponent, SpinnerConfig, SpinnerValue } from "cruzo/ui-components/spinner";
import { UploadComponent, UploadConfig } from "cruzo/ui-components/upload";
import { ModalComponent, ModalConfig } from "cruzo/ui-components/modal";
```

CSS is also per-component:

```ts
import "cruzo/ui-components/input.css";
import "cruzo/ui-components/button-group.css";
import "cruzo/ui-components/select.css";
import "cruzo/ui-components/spinner.css";
import "cruzo/ui-components/modal.css";
import "cruzo/ui-components/upload.css";
```

---

## // Notes For Night Shift

- no default export
- no runtime deps
- no global css reset bundled
- UI components are opt-in by import path
- template expressions run in Cruzo VM (not eval)

---

## License

MIT
