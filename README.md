# C R U Z O

<img src="https://raw.githubusercontent.com/MaratBektemirov/cruzo/refs/heads/master/assets/cruzo.png" alt="cruzo" width="100" height="100" />

> Zero-dependency reactive framework + expression VM.  
> No VDOM. No magic build step. Just HTML + Rx + bytecode.

[![npm version](https://img.shields.io/npm/v/cruzo.svg)](https://www.npmjs.com/package/cruzo)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

---

## Contents

| | |
| --- | --- |
| **Start here** | [Overview](#overview) · [Install](#install) · [First component](#first-component) |
| **Core** | [Templates](#templates) · [Components](#components) · [RxBucket](#rxbucket) · [i18n](#i18n) |
| **Services** | [Router](#router) · [HTTP](#http) |
| **UI kit** | [Imports & CSS](#imports--css) · [Components](#ui-components) · [Toast](#toast) |
| **Reference** | [Bundle size](#bundle-size) · [Public API](#public-api) · [Development](#development) · [Changelog](./CHANGELOG.md) |

---

## Overview

`cruzo` is a tiny browser UI framework:

| Layer | What you get |
| --- | --- |
| **Reactivity** | `newRx`, `newRxFunc` on components and services |
| **Templates** | `{{ }}` expressions compiled to a bytecode VM (CSP-safe — no `eval`) |
| **State wiring** | `RxBucket` — shared config/value/state/events without prop drilling |
| **Routing** | `RouteUrlBucket`, `routerService`, lazy `loadResources` |
| **HTTP** | `HttpClient` — interceptors, abort, GET/HEAD cache |
| **UI kit** | Optional subpath imports (`cruzo/ui-components/*`) |

Full control over the DOM and a small runtime footprint — that is the trade-off Cruzo optimizes for.

**Resources:** [cruzo.org](https://cruzo.org) · [VSCode syntax](https://marketplace.visualstudio.com/items?itemName=cruzo.cruzo-syntax) · [Vite starter](https://github.com/MaratBektemirov/cruzo-starter)

---

## Install

```bash
npm i cruzo
```

Register components, call `initApp()`, place tags in HTML — no framework-specific build step required (works with Vite, Rollup, Webpack).

---

## First component

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

```html
<counter-component></counter-component>
```

**Typical flow:** `define()` every component class → `initApp()` once → Cruzo connects tags already in the DOM and keeps templates reactive.

---

## Core concepts

### Templates

Templates are HTML strings (usually from `getHTML()`). Cruzo scans them for **`{{ … }}`** — every match is one expression.

**The rule:** whatever sits inside the braces is Cruzo syntax — text interpolation, `onclick`, `repeat`, `attached`, `inner-html`, `value`, `let-*`, all the same. Each expression compiles once to bytecode and runs in a small VM (CSP-safe, no `eval`).

Outside `{{ }}` is plain HTML: tags, classes, static attributes. Logic stays in braces and on `root` (your component or `self`). No JSX, no second template language — **`::rx`, `once::`, method calls, operators: all live inside `{{ }}`, nowhere else.**

**Reactive read (`::rx`):** inside an expression, `field$::rx` reads an `Rx` and re-runs the expression when it changes — same operator in text, `repeat`, `attached`, attributes:

```html
{{ root.count$::rx }}
repeat="{{ root.items$::rx }}"
attached="{{ root.open$::rx }}"
value="{{ root.name$::rx }}"
```

Plain `{{ root.title }}` (no `::rx`) reads the current value when the template updates; `::rx` wires auto-updates.

| Feature | Syntax |
| --- | --- |
| Text | `{{ root.title$::rx }}` |
| Event | `onclick="{{ root.save() }}"` |
| Reactive read | `{{ root.field$::rx }}` |
| One-time | `{{ once::root.version }}` |
| Loop | `repeat="{{ root.items$::rx }}"` |
| Loop scope | `let-label="{{ this.label }}"` |
| Conditional DOM | `attached="{{ root.open$::rx }}"` |
| Raw HTML | `inner-html="{{ root.html$::rx }}"` |

**Context inside `{{ }}`:** `root` is the component instance (or `self` in standalone `Template`); `this` is the current `repeat` item.

```html
<ul repeat="{{root.items$::rx}}" let-label="{{this.label}}" let-id="{{this.id}}">
  <li onclick="{{root.pick(id)}}">{{label}}</li>
</ul>

<section attached="{{root.open$::rx}}">
  selected: {{root.selected$::rx ?? "none"}}
</section>
```

#### Standalone `Template` (no component base)

Import only `Template` for ~10 KB gzip (see [Bundle size](#bundle-size)):

```ts
import { Template } from "cruzo";

const node = document.querySelector("#panel") as HTMLElement;

let tpl: Template;

const self = {
  title: "hello",
  bump() {
    this.title += "!";
    tpl.detectChanges();
  },
};

node.innerHTML = `<h2>{{root.title}}</h2><button onclick="{{root.bump()}}">+</button>`;

tpl = new Template({ node, self: () => self });
tpl.detectChanges();
```

Call `tpl.fullDestroy()` when removing the node from the DOM. For auto-updates, use `Rx` on `root` and read it with `{{ root.field$::rx }}` (in components — `this.newRx()`).

---

### Components

Custom elements extend `AbstractComponent`. Tag name **must equal** `static selector`.

#### Lifecycle

| Phase | What happens |
| --- | --- |
| `define(Cls)` | Registers selector → constructor |
| `initApp()` | Scans DOM, connects buckets, runs router |
| `connectedCallback` | Wires bucket, `routeParams$`, route `httpFactory` → `this.http`, builds template |
| `disconnectedCallback` | Aborts HTTP, destroys template, unsubscribes Rx, clears `routeParams$` |

Guard async work with `this.destroyed` after disconnect.

#### Nested tags (`dependencies`)

Every Cruzo tag in `getHTML()` must appear in `dependencies` so the registry connects child components:

```ts
import { ChildComponent } from "./child.component";

class ParentComponent extends AbstractComponent {
  static selector = "parent-component";
  dependencies = new Set([ChildComponent.selector]);

  getHTML() {
    return `<child-component></child-component>`;
  }
}

componentsRegistryService.define(ParentComponent);
componentsRegistryService.define(ChildComponent);
```

Use a **string selector** for Modal `bodyContent`, dynamic `inner-html`, or circular imports: `new Set(["child-component"])`.

#### Reactive `inner-html`

When `inner-html` changes at runtime, Cruzo reconnects only selectors listed in `dependencies`. Other custom element tags stay inert.

```ts
class PanelComponent extends AbstractComponent {
  static selector = "panel-component";
  dependencies = new Set(["detail-component"]);

  body$ = this.newRx("<detail-component></detail-component>");

  getHTML() {
    return `<div inner-html="{{root.body$::rx}}"></div>`;
  }
}
```

`{{ }}` inside the inserted HTML string is **not** scanned — only the attribute expression runs. Put interactive UI in a child component.

---

### RxBucket

Share config, value, state, and events across nested UI via `bucket-id` + `component-id` — no prop drilling through layout wrappers.

```ts
import { AbstractComponent, RxBucket } from "cruzo";
import { InputConfig } from "cruzo/ui-components/input";
import { SelectConfig } from "cruzo/ui-components/select";

class SearchPanelComponent extends AbstractComponent {
  static selector = "search-panel-component";

  innerBucket = new RxBucket({
    searchInput: { config: InputConfig({ placeholder: "find by title..." }) },
    sortSelect: {
      config: SelectConfig({
        placeholder: "Sort by...",
        getItems: async () => [
          { label: "Newest", value: "new" },
          { label: "Oldest", value: "old" },
        ],
      }),
    },
  });

  query$ = this.newRxValueFromBucket(this.innerBucket, "searchInput");
  sort$ = this.newRxValueFromBucket(this.innerBucket, "sortSelect");

  getHTML() {
    return `
      <section>
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

**Data model** (keyed by descriptor id):

| Slot | Scope | API |
| --- | --- | --- |
| **config** | One object per id | `bucket.setConfig(id, value)` → child `config$` |
| **value** / **state** | Per id + `component-index` | `setValues`, `setStates`, `*AtIndex` helpers; subscribe with `newRxValueFromBucket` / `newRxStateFromBucket` |
| **value** / **state** (all indexes) | Per id — full `{ [index]: … }` map | `newRxValueAll` / `newRxStateAll`, or `newRxValueAllFromBucket` / `newRxStateAllFromBucket` |
| **events** | Per id | `bucket.emitEvent(id, name, payload)`; subscribe via `newRxEventFromBucket` |

Use buckets incrementally — only where cross-component wiring is needed; same `newRx` primitives everywhere else.

---

### i18n

`i18nService` connects a locale JSON dictionary to a component. Put messages next to the component (e.g. `demo-toast-component.json`):

```json
{
  "en": {
    "title": "Files",
    "files": {
      "one": "{{n}} file",
      "other": "{{n}} files"
    }
  },
  "ru": {
    "title": "Файлы",
    "files": {
      "one": "{{n}} файл",
      "few": "{{n}} файла",
      "many": "{{n}} файлов",
      "other": "{{n}} файла"
    }
  }
}
```

```ts
import { AbstractComponent, i18nService } from "cruzo";
import messages from "./demo-toast-component.json";

class DemoToastComponent extends AbstractComponent {
  static selector = "demo-toast-component";

  count$ = this.newRx(1);
  i18n$ = i18nService.connect(this, messages);

  getHTML() {
    return `
      <h3>{{ root.i18n$::rx.title }}</h3>
      <p>{{ root.i18n$::rx.plural("files", root.count$::rx) }}</p>
    `;
  }
}

i18nService.setLang("ru");
```

`plural` uses `Intl.PluralRules` for the active locale. `{{n}}` in forms is replaced with the number.

Built-in UI kit strings follow the same service: `select` (`noOptions`) and `toast` (`close` aria-label) ship with `en` / `ru` / `fr`. Switch via `i18nService.setLang("fr")`.

---

## Built-in services

### Router

```ts
import { RouteUrlBucket, routerService, HttpClient } from "cruzo";

const api = new HttpClient("https://api.example.com");

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
    loadResources: () => import("./pages/docs.page.js"),
    httpFactory: {
      api: (signal) => api.factory(signal),
    },
  },
  oldDocs: {
    url: "/guide/*rest",
    redirectTo: "/docs/intro",
  },
});

routes.buildUrl("docs", { slug: "template-vm" }); // → /docs/template-vm
routerService.pushHistory(routes.buildUrl("docs", { slug: "intro" }));
```

**`routerService` helpers**

| API | Role |
| --- | --- |
| `pathname$`, `search$` | Reactive URL (virtual path in hash mode) |
| `resourcesLoading$` | `true` while `loadResources` pending |
| `pushHistory(href)`, `pushHistoryLink(event, href)` | Navigation |
| `hrefIsActive(href, opts)` | Active link checks |
| `setHashMode` / `isHashMode` | Hash routing for static hosts |
| `routeParams$` on page | Route params, e.g. `{{root.routeParams$::rx.slug}}` |
| `httpFactory` on rule | `this.http.api` on page — aborted on unmount |
| `loadResources` | Lazy chunk + `define()` before mount |

#### Hash mode

For static hosting without SPA fallback on the server:

```ts
routerService.setHashMode(true);
routerService.update();
```

| Topic | Behavior |
| --- | --- |
| Matching | Patterns match path inside `location.hash` (`#/docs/intro?tab=api`) |
| `pathname$` / `search$` | Virtual path after `#`, not document pathname |
| `pushHistory` | Accepts `/path` or `#/path` — normalized to same hash |
| `buildUrl` | Returns `#/path?query` in hash mode |
| `redirectTo` | Written as path; applied as `#/…` on current document URL |

---

### HTTP

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

| Feature | Detail |
| --- | --- |
| Body / headers | Auto `content-type`; JSON, text, form-urlencoded |
| Abort | `api.factory(signal)` — used by route `httpFactory` |
| Cache | In-memory, **GET / HEAD only** (`cacheTime` TTL, per-request `useCache`) |

---

## UI kit

Optional components via subpath imports — not included in core bundle numbers.

### Imports & CSS

```ts
import { InputComponent, InputConfig } from "cruzo/ui-components/input";
import { SelectComponent, SelectConfig } from "cruzo/ui-components/select";
import { ModalComponent, ModalConfig } from "cruzo/ui-components/modal";
import { ToastComponent } from "cruzo/ui-components/toast";
import { RouterLinkComponent, RouterLinkConfig } from "cruzo/ui-components/router-link";
import { UI_KIT } from "cruzo/ui-components/const";

import "cruzo/ui-components/vars.css";   // always first — design tokens
import "cruzo/ui-components/input.css";  // only what you use
```

**Available subpaths:** `input`, `textarea`, `select`, `spinner`, `button-group`, `modal`, `upload`, `toast`, `router-link`, `const`.  
**Stylesheets:** `vars.css`, `input.css`, `textarea.css`, `select.css`, `spinner.css`, `button-group.css`, `modal.css`, `upload.css`, `toast.css`, `button.css`, `checkbox.css`, `margin.css`.

Override tokens on `:root` after `vars.css`. Use `${UI_KIT}_…` for classes, `${UI_KIT}--…` for modifiers (prefix = `cruzo-ui-component`).

### UI components

| Component | Notes |
| --- | --- |
| **Input / Textarea** | `config$` from bucket descriptor; extra classes via `state.cls` |
| **Select** | `getItems(value, isOpen)` in config; concurrent loads deduped |
| **Spinner, Button group, Upload** | Template binds `root.config$::rx` |
| **Router link** | Active state via `routerService.hrefIsActive` |
| **Modal** | `ModalComponent.attach(id, bucketId)`; body via `inner-html` + `dependencies` |
| **Button** | No component — native `<button>` + `button.css` classes |

### Toast

`toastService` lives in the core package; **`ToastComponent`** and CSS come from the UI kit subpath. Import the component as a **value** (bundlers may drop side-effect-only modules).

```ts
import { toastService } from "cruzo";
import { ToastComponent } from "cruzo/ui-components/toast";
import type { ToastShowParams } from "cruzo/ui-components/toast";
import "cruzo/ui-components/toast.css";

toastService.show({ message: "Saved", kind: "success" });

toastService.show({
  title: "Heads up",
  message: "Check the form",
  kind: "error",
  timeoutMs: 5000,
  element: document.querySelector("#save-btn"),
  alignX: "center",
  alignY: "bottom",
});

toastService.dismiss(id);
toastService.clear();
```

Kinds: `"info" | "success" | "error"`. Reactive list: `toastService.toasts$`. Anchor via `element` (bounding rect) or `anchor: { x, y }`; `alignX` / `alignY` for placement (default viewport center).

**Modal example**

```ts
ModalConfig({
  bodyContent: `<my-modal-body-component></my-modal-body-component>`,
  dependencies: new Set(["my-modal-body-component"]),
});

// close from body:
bucket.emitEvent("myModal", "closeModal", { data: { isOK: true } });
```

**Standalone button**

```html
<button type="button" class="cruzo-ui-component_button cruzo-ui-component_button-s cruzo-ui-component_button-primary">
  Save
</button>
```

---

## Reference

### Bundle size

Tree-shakeable ESM · `preserveModules` · zero runtime deps.  
Numbers = production gzip in **your app bundle** after Vite/Rollup/Webpack — not the sum of all files in `node_modules/cruzo/dist`.

| Import profile | minified | gzip |
| --- | --- | --- |
| `Template` only | 31.1 KB | 9.7 KB |
| + `AbstractComponent` | 38.4 KB | 11.5 KB |
| Full core (router, http, …) | 44.3 KB | 13.6 KB |
| UI kit subpaths | extra | per import |

**Import tiers**

```ts
// Tier 1 — templates (~10 KB gzip)
import { Template } from "cruzo";

// Tier 2 — components (~12 KB gzip)
import { AbstractComponent, componentsRegistryService } from "cruzo";

// Tier 3 — full core (~14 KB gzip)
import { RxBucket, routerService, RouteUrlBucket, HttpClient, toastService, i18nService } from "cruzo";

// Utils — decoupled from main entry
import { delay } from "cruzo/utils";
```

**Tips:** import only symbols you use (`sideEffects` covers `*.css` only); lazy routes via `loadResources`; reproduce locally: `node scripts/measure-tree-shake.mjs` after `npm run build`.

---

### Public API

<details>
<summary><strong>Root export</strong> — <code>import { … } from "cruzo"</code></summary>

```ts
import {
  Template,
  AbstractComponent,
  AbstractService,
  RxBucket,
  componentsRegistryService,
  routerService,
  RouteUrlBucket,
  toastService,
  i18nService,
  HttpClient,
  HttpError,
  Rx,
  RxFunc,
  delay,
  debounce,
  arrayToHash,
} from "cruzo";
```

Types: `HttpRequestOptions`, `Interceptors`, `HttpMethod`, `IHttpClient`, `HttpFactory`, `AbstractComponentConstructor`, `ComponentDescriptor`, `ComponentConnectedParams`, `BucketEvent`, `ComponentsList`, `RuleCompleted`, `I18nMessages`, `I18nLocaleDict`, `I18nLocaleView`, `I18nPluralForms`, `I18nPluralCategory`.

</details>

<details>
<summary><strong>Subpaths</strong></summary>

```ts
import { delay, debounce, arrayToHash } from "cruzo/utils";
import { InputComponent, InputConfig } from "cruzo/ui-components/input";
import type { ToastShowParams } from "cruzo/ui-components/toast";
```

</details>

**Design constraints**

- No default export · no runtime dependencies · no bundled CSS reset
- UI components are opt-in by import path
- Template expressions run in Cruzo VM — not `eval`

---

### Development

```bash
npm ci
npm run typecheck   # tsc
npm test            # vitest
npm run build       # dist + .d.ts
```

CI (`.github/workflows/ci.yml`): `typecheck` + `test` on push/PR.  
Release notes: [CHANGELOG.md](./CHANGELOG.md)

---

## License

MIT
