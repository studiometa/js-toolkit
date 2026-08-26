# Instance events

Everything an instance dispatches is a real DOM event, so a plain `addEventListener` hears all of it.

[[toc]]

## Component events

`$emit(name, payload?)` dispatches on `$el`:

| Property     | Value                         |
| ------------ | ----------------------------- |
| `bubbles`    | `true`                        |
| `cancelable` | `true`                        |
| `detail`     | the payload object, or `null` |

Names are typed lower-kebab string literals declared through the props type's `$emits` key. There is no namespace: a component event is `open`, not `js-toolkit:open`.

```js
el.addEventListener('goto', (event) => {
  console.log(event.detail.index);
});
```

## Lifecycle announcements

Every instance announces its own mount and unmount, carrying itself in the payload:

```ts
interface LifecycleEventDetail {
  instance: Base;
}
```

| Event                            | Constant                     | Dispatched from           |
| -------------------------------- | ---------------------------- | ------------------------- |
| `js-toolkit:component:mounted`   | `EVENTS.component.mounted`   | the element — **bubbles** |
| `js-toolkit:component:unmounted` | `EVENTS.component.unmounted` | `document`                |

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"46f7d5f5ab9ee9828791816feaef005bac51879c1991a487993c35ef5ad15c24","data":"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"}
import { EVENTS, type LifecycleEventDetail } from '@studiometa/js-toolkit';

document.addEventListener(EVENTS.component.mounted, (rawEvent) => {
  const event = rawEvent as CustomEvent<LifecycleEventDetail>;
  console.log(`${event.detail.instance.$id} mounted`);
});
```

The unmount event dispatches from `document` because the element can already be detached. That is also what lets one lazy, realm-shared listener serve every [`$watchChildren()`](/api/instance-methods.html#watchchildren) watcher while the document holds nothing but weak references to them — a listener per watcher would make every watching component immortal.

**An instance that is scheduled but not mounted announces nothing.**

## Diagnostics

`js-toolkit:diagnostic` — `EVENTS.diagnostic` — starts on the relevant connected element, or on `document` when there is none, with `{ bubbles: true, composed: true, cancelable: true }`.

`preventDefault()` suppresses the default console output only. See [Diagnostics](/api/diagnostics/).

## Negotiated events

`js-toolkit:dom:update` — `EVENTS.dom.update` — is dispatched by [`domUpdate()`](/api/dom/domUpdate.html), and [`emitExtendable()`](/api/dom/emitExtendable.html) dispatches the name its caller gives.

Both are bubbling and **non-cancelable**: the step is announced, not proposed. Their detail carries a `wrap()` or a `waitUntil()` valid only while the event dispatches.

They have **no `Base` path** and are absent from `$emits`, so the negotiation code and the optional view-transition import stay out of the `Base` graph. Plain DOM code uses the same functions with no instance.

## Private transports

The context request is a bubbling, **module-private** event and is deliberately not part of public `EVENTS`. Framework internals that need a transport use module-local namespaced constants; only what a consumer can usefully listen to is exported.

## The convention, in full

- Public framework events use the deeply frozen `EVENTS` object and the `js-toolkit:` namespace.
- Private framework transports use module-local constants and do not join `EVENTS`.
- Component events use typed lower-kebab string literals from `$emits`.
- A payload is **one object** in `CustomEvent.detail`, or the platform value `null`.
- Diagnostic events are cancelable, so monitoring can suppress the default output only.
