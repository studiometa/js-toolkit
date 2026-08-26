# EVENTS

A deeply frozen object of the events the framework itself dispatches, all namespaced `js-toolkit:`.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"4be32aa2e4c3d8ac70df162e8372131735d9b395308826383b062c104e476e39","data":"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"}
import { EVENTS } from '@studiometa/js-toolkit-v4';

EVENTS.component.mounted; // 'js-toolkit:component:mounted'
EVENTS.component.unmounted; // 'js-toolkit:component:unmounted'
EVENTS.dom.update; // 'js-toolkit:dom:update'
EVENTS.diagnostic; // 'js-toolkit:diagnostic'
```

## The events

| Constant                     | Name                             | Dispatched from           | Cancelable |
| ---------------------------- | -------------------------------- | ------------------------- | ---------- |
| `EVENTS.component.mounted`   | `js-toolkit:component:mounted`   | the element, **bubbling** | no         |
| `EVENTS.component.unmounted` | `js-toolkit:component:unmounted` | `document`                | no         |
| `EVENTS.dom.update`          | `js-toolkit:dom:update`          | the given node, bubbling  | no         |
| `EVENTS.diagnostic`          | `js-toolkit:diagnostic`          | the element or `document` | **yes**    |

See [Instance events](/api/instance-events.html) for the lifecycle pair, [`domUpdate()`](/api/dom/domUpdate.html) for the update event, and [Diagnostics](./index.html) for the diagnostic.

## The convention

- **Public framework events** use this object and the `js-toolkit:` namespace.
- **Private framework transports** use module-local namespaced constants and **do not join `EVENTS`** — the context request is one.
- **Component events** are typed lower-kebab string literals declared through the props type's `$emits` key. They have no namespace: a component event is `open`, not `js-toolkit:open`.
- A payload is **one object** in `CustomEvent.detail`, or the platform value `null`.
- Diagnostic events are cancelable, so monitoring can suppress the default output only.

Only what a consumer can usefully listen to is exported. That is the whole rule for whether something belongs here.

## Import it on its own

```js twoslash
// @twoslash-cache: {"v":1,"hash":"f5ca950a734c34e5e7d02691b812328df8d8c269e3cd2ae662062c9373795c5e","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeAUQBqYgHIAVAMqJeAJRjMoQ1hgA8wADpheR3qTUawWgRAC2WITDBolq9Zp37Dxr6dcWMvawgAV0cYKCU9EAArOABaNAgIVgBrdidBW3tHRECQmihIgG4DL28zN14Q3NDw3kiY+MSUtMQMuzAHJyrgmqKS4wBfAD5izyMfc0sNa2dyv11+0pM5yyCsKGYaCOi4hKTUp2nENY2aPrHeYdGy3ynOAHNIEXZ+bYa95sOHp7QX8+GDOxMqRRJIZApKCANPwEIgQAAFIIAIw4/F4ADNSMxrDAAO4QUjJXgwEiOXhgbHwAB0kJEzBBSAAnFRWA57mh8EgAGxUND0+4wBhwsFyeSQjgdJAABio/Hw9OY/Bo5EQjIGAF1ZdBcHCgXYQbxgOIpKLLhjSDZeAByAACIiCUHYNkFzAA9O8mgdYkQACyukUKK2FSE4vlIUB0GjCJ1gPAxEADAZAA="}
import { EVENTS } from '@studiometa/js-toolkit-v4/EVENTS';
```

The generated subpath keeps the frozen object importable without the root barrel — which matters on a page with no build step, where a barrel import downloads the barrel's whole graph.

## `EVENTS.error` is removed

With **no alias**. `EVENTS.error`, `ToolkitErrorDetail` and `ToolkitErrorStage` are gone; `EVENTS.diagnostic` and the [`DIAGNOSTICS`](./DIAGNOSTICS.html) codes replace them.
