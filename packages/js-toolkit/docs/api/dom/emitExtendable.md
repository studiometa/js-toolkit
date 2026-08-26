# emitExtendable

```ts
emitExtendable(target: Node, event: string, detail?: Record<string, unknown>): Promise<void>
```

Announces a step before it happens, so anything above the node can **delay** it.

This is the _delay_ mode of the negotiated-event mechanism. The _take-over_ mode is [`domUpdate()`](./domUpdate.html).

[[toc]]

## Usage

The choreography announces its step and waits:

```js
import { emitExtendable } from '@studiometa/js-toolkit';

async close() {
  await emitExtendable(this.$el, 'close');
  this.$el.close();
}
```

An ancestor asks for more time:

```js
this.$on('close', ({ detail }) => detail.waitUntil(this.leave()));
```

## The detail

```ts
interface ExtendableDetail {
  waitUntil(extension: Extension): void;
}

type Extension = PromiseLike<unknown> | (() => unknown) | Record<string, unknown>;
```

`waitUntil()` accepts three shapes:

| Shape                     | Example                         |
| ------------------------- | ------------------------------- |
| a thenable                | `waitUntil(this.leave())`       |
| a function                | `waitUntil(() => this.enter())` |
| an object with the method | `waitUntil(transitioner)`       |

**The duck-typed method has the name of the event**: `close()` for the `close` step of a dialog, `update(mutate)` for a DOM change. The function form covers any pair of method names.

The event is dispatched on `target` as a bubbling, **non-cancelable** `CustomEvent`.

## The rules

- **`defaultPrevented` is ignored.** The step is announced, not proposed.
- **Every registration is kept and all are awaited**, because two components that animate out must both be awaited. This is where it differs from `domUpdate()`, which keeps one.
- **A registration is valid only while the event dispatches.** A listener that keeps `waitUntil` and calls it later is reported as `protocol.late-registration` and ignored.
- **The step happens anyway.** An extension that rejects is swallowed, and reported as `callback.extendable-event-extension-failed`.

## It has no `Base` path

The helper dispatches its own event and is absent from `$emits`. Plain DOM code uses the same function with no instance.

## Which mode to reach for

| You are announcing                                    | Use                               |
| ----------------------------------------------------- | --------------------------------- |
| an **action** someone may want to perform differently | [`domUpdate()`](./domUpdate.html) |
| a **moment** someone may want to postpone             | `emitExtendable()`                |
