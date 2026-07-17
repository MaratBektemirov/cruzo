# Changelog

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
