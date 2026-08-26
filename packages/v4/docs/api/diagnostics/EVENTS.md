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
// @twoslash-cache: {"v":1,"hash":"f5ca950a734c34e5e7d02691b812328df8d8c269e3cd2ae662062c9373795c5e","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeAUQBqYgHIAVAMqJeAJRjMoQ1hgA8wADpheR3qTUawWgRAC2WITDBolq9Zp37Dxr6dcWMvawgAV0cYKCU9EAArOABaNAgIVgBrdidBW3tHRECQmihIgG4DL28zN14Q3NDw3kiY+MSUtMQMuzAHJyrgmqKS4wBfAD5izyMfc0sNa2dyv11+0pM5yyCsKGYaCOi4hKTUp2nENY2aPrHeYdGy3ynOAHNIEXZ+bYa95sOHp7QX8+GDOxMqRRJIZApKCANPwEIgQAAFIIAIw4/F4ADNSMxrDAAO4QUjJXgwEiOXhgbHwAB0kLQzHusOQyBAHDAyUh+DQaCwcEQAHo+e8mgdYkQACxUkRBKDsGwwOlU2BEPnMLDsPky+k/F5wPlguTyKmc6ysEAAXTNVBEzBBSAAnFRWA57mh8EgAGxUOmke7yvD6iGO9gdJAABio/HwNuY/Bo5EQdoGlpAglgeCBdhBvGA4ikBsuGNINl4AHIAAJSmVyumC3bCtKisV6vMKEuFSE4ulIUB0GjCWVgPAxEADAZAA==="}
import { EVENTS } from '@studiometa/js-toolkit-v4/EVENTS';
```

The generated subpath keeps the frozen object importable without the root barrel — which matters on a page with no build step, where a barrel import downloads the barrel's whole graph.

## `EVENTS.error` is removed

With **no alias**. `EVENTS.error`, `ToolkitErrorDetail` and `ToolkitErrorStage` are gone; `EVENTS.diagnostic` and the [`DIAGNOSTICS`](./DIAGNOSTICS.html) codes replace them.
