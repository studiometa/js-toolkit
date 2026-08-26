# EVENTS

A deeply frozen object of the events the framework itself dispatches, all namespaced `js-toolkit:`.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"3832de98eb13b02a7f1b923cc868222c035d4d3b7013e32ed679f9dde349c5f7","data":"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"}
import { EVENTS } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"39cfe8e71879da819cc0deb1077598a736b91b7ab60e685896f704144eee349f","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeAUQBqYgHIAVAMqJeAJRjMoQ1hgA8wADpheR3qTUawWgRAC2WITDBolq9Zp37Dxr6dcWMvawgAV0cYKCU9EAArOABaNAgIVgBrdidBW3tHRECQmihIgG4DL28zN14Q3NDw3kiY+MSUtMQMuzAHJyrgmqKS4wBfAD5izyMfc0sNa2dyv11+0pM5yyCsKGYaCOi4hKTUp2nENY2aPrHeYdGy3ynOAHNIEXZ+bYa95sOHp7QX8+GDOxMqRRJIZApKCANPwEIgQAAFIIAIw4/F4ADNSMxrDAAO4QUjJXgwEiOXhgbHwAB0kLQzHusOQyBAHDAyUh+DQaCwcEQAHo+e8mgdYkQACxUkRBKDsGwwOlU2BEPnMLDsPky+k/F5wPlguTyKmc6ysEAAXTNVBEzBBSAAnFRWA57mh8EgAGxUOmke7yvD6iGO9gdJAABio/HwNuY/Bo5EQdoGlpAglgeCBdhBvGA4ikBsuGNINl4AHIAAJSmVyumC3bCtJ6vMKEuFSE4ulIUB0GjCWVgPAxEADAZAA=="}
import { EVENTS } from '@studiometa/js-toolkit/EVENTS';
```

The generated subpath keeps the frozen object importable without the root barrel — which matters on a page with no build step, where a barrel import downloads the barrel's whole graph.

## `EVENTS.error` is removed

With **no alias**. `EVENTS.error`, `ToolkitErrorDetail` and `ToolkitErrorStage` are gone; `EVENTS.diagnostic` and the [`DIAGNOSTICS`](./DIAGNOSTICS.html) codes replace them.
