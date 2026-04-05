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
- shared data bus via `RxBucket`
- built-in router (`RouteUrlBucket`, `routerService`)
- built-in HTTP client (`HttpClient`) with interceptors, cache, abort
- optional UI components as separate entrypoints

If you want full control over DOM and a small runtime footprint, this is your lane.

---

## // Install

```bash
npm i cruzo
```
- Official site and examples: (https://cruzo.org)
- VSCode extension (syntax): [cruzo-syntax](https://marketplace.visualstudio.com/items?itemName=cruzo.cruzo-syntax)
- Cruzo starter (Vite) https://github.com/MaratBektemirov/cruzo-starter

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

## // RxBucket: shared config/state/value/events

```ts
import { AbstractComponent, RxBucket } from "cruzo";

class SearchPanelComponent extends AbstractComponent {
  static selector = "search-panel-component";

  innerBucket = new RxBucket({
    searchInput: { config: { placeholder: "find by title..." } },
    sortSelect: {
      config: {
        options: [
          { id: "new", value: "Newest" },
          { id: "old", value: "Oldest" },
        ],
      },
    },
  });

  query$ = this.newRxValueFromBucket(this.innerBucket, "searchInput");
  sort$ = this.newRxValueFromBucket(this.innerBucket, "sortSelect");

  getHTML() {
    return `
      <section>
        <!-- `toolbar-layout` is just layout wrapper: no props relay needed -->
        <toolbar-layout>
          <input-component component-id="searchInput" bucket-id="${this.innerBucket.id}"></input-component>
          <select-component component-id="sortSelect" bucket-id="${this.innerBucket.id}"></select-component>
        </toolbar-layout>

        <pre>query: {{root.query$::rx}}</pre>
        <pre>sort: {{root.sort$::rx}}</pre>
      </section>
    `;
  }
}
```

Use `bucket-id` + `component-id` to route descriptor/config/value into components. Even if UI is nested through layout wrappers, components share state via bucket directly (no prop drilling through every level).

### Why RxBucket

- avoids prop drilling by passing context through `bucket-id`/`component-id` instead of multi-level props relay
- keeps state local to feature boundaries without forcing a single global store
- works with existing `newRx`/`newRxFunc` primitives, so no extra architecture layer is required
- lower boilerplate than `redux`/`flux`/`ngrx` (no action constants, reducers, effects setup for simple shared state)
- predictable reactive updates without VDOM diffing and without store ceremony for component-level flows
- easy incremental adoption: use `RxBucket` only where cross-component state/config sharing is needed

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

routes.buildUrl("docs", { slug: "template-vm" }); // /docs/template-vm (history mode)
// With routerService.setHashMode(true): "#/docs/template-vm"
// Optional: buildUrl(key, params, query?)
```

`routerService` also provides:

- `pushHistory(href)`
- `pushHistoryLink(event, href)`
- `hrefIsActive(href, { startsWith, ignoreSearch })`
- reactive URL streams: `pathname$` and `search$` (both follow the **routed** path and query — see hash mode below)

### Hash mode (`#/path?query`)

For static hosting without server-side fallback to `index.html`, enable hash routing so the real page path stays fixed (for example `/` or `/app.html`) while the SPA path lives in the fragment:

```ts
import { routerService } from "cruzo";

routerService.setHashMode(true);
routerService.update();
```

Behavior when hash mode is on:

- **Matching** — route patterns such as `/docs/:slug` are matched against the path parsed from `location.hash`, not `location.pathname`. The expected shape is `#/path/to/page` with an optional query inside the hash: `#/docs/intro?tab=api`.
- **`pathname$` / `search$`** — reflect that virtual path and query string (the part after `#`), not the browser pathname/search.
- **`pushHistory`** — you can pass either a normal path (`/docs/intro?tab=api`) or a hash URL (`#/docs/intro?tab=api`); both are normalized to the same `location.hash`.
- **`routes.buildUrl`** — returns `#/path?query` in the same shape as `pushHistory` expects (no leading document pathname). Optional `URLSearchParams` builds the query string; append a fragment yourself if you need `#section` in history mode.
- **`redirectTo`** — still written as a path (e.g. `/docs/intro`); it is applied as the corresponding `#/…` entry on the current document URL.

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

CSS is also per-component. Shared tokens live in **`vars.css`**: `:root` variables for typography, spacing, surfaces, text colors, accents, shadows, radii, and spinner options. Components reference only these names (no baked-in theme fallbacks), so **import `vars.css` first**, then each component stylesheet. To restyle the set, override the same variables on `:root` (or a wrapper) after importing `vars.css`, or ship your own token file with matching names.

```ts
import "cruzo/ui-components/vars.css";
import "cruzo/ui-components/input.css";
import "cruzo/ui-components/button-group.css";
import "cruzo/ui-components/select.css";
import "cruzo/ui-components/spinner.css";
import "cruzo/ui-components/modal.css";
import "cruzo/ui-components/upload.css";
```

---

## // Public API (current)

Root import:

```ts
import {
  Template,
  AbstractComponent,
  AbstractService,
  RxBucket,
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
  BucketEvent,
  Rx,
  RxFunc,
} from "cruzo";
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
