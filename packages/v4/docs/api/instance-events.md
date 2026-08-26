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
