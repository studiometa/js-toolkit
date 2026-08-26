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
// @twoslash-cache: {"v":1,"hash":"69db3da12b789fdd68f3ac61dfa5abd09208cbbd003ef5369a7295b682fb877a","data":"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"}
import { EVENTS, type LifecycleEventDetail } from '@studiometa/js-toolkit-v4';

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
