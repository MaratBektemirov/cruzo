# Changelog

## 1.2.1

- `lang$` resolves from `localStorage` → browser locale → `defaultLang`; `setLang` persists the choice
- `setDefaultLang`; missing locale in a dictionary quietly falls back to `defaultLang`

## 1.2.0

- `i18nService` — `lang$`, `setLang`, `connect(component, messages)` → `i18n$`, and `plural` via `Intl.PluralRules`
- Locale JSON shape: `{ "en": { "title": "…", "files": { "one": "{{n}} file", "other": "{{n}} files" } } }`
- UI kit built-in copy (`select` empty state, `toast` close aria-label) ships with `en` / `ru` / `fr`

## 1.1.0

- `RxBucket.removeIndex(id, index)` — drop value, state, and per-index subscriptions for one component slot
- Repeat lists reconcile DOM clones by **array item reference** (`this`): stable objects keep their clone on insert, delete, and reorder; replacing all items with new objects rebuilds clones from scratch
- `RxBucket.newRxValueAll` / `newRxStateAll` — subscribe to the full value/state map for an id (all indexes)
- `AbstractComponent.newRxValueAllFromBucket` / `newRxStateAllFromBucket` — component helpers for the same

## 1.0.0

First stable release.

- Template VM (`{{ }}` expressions, no `eval`)
- `AbstractComponent`, registry, `RxBucket`
- Router, `HttpClient`, `toastService`
- UI kit via `cruzo/ui-components/*`
- Zero runtime dependencies, tree-shakeable ESM
