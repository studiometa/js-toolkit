# domUpdate

```ts
domUpdate(target: Node, mutate: () => void | Promise<void>, detail?: Record<string, unknown>): Promise<void>
```

Announces a DOM mutation before it happens, so anything above the node can **take it over**.

This is the _take-over_ mode of the negotiated-event mechanism. The _delay_ mode is [`emitExtendable()`](./emitExtendable.html).

[[toc]]

## Usage

The code that mutates announces instead of mutating:

```js
import { domUpdate } from '@studiometa/js-toolkit';

await domUpdate(this.$el, () => this.$el.replaceChildren(fragment));
```

An ancestor claims it:

```js
import { EVENTS, viewTransition } from '@studiometa/js-toolkit';

this.$on(EVENTS.dom.update, ({ detail }) => detail.wrap(viewTransition));
```

## The detail

```ts
interface DomUpdateDetail {
  wrap(runner: DomUpdateRunner): void;
}

type DomUpdateRunner =
  | ((apply: () => void | Promise<void>) => void | Promise<unknown>)
  | { update(mutate: () => void | Promise<void>): void | Promise<unknown> };
```

The event is `EVENTS.dom.update` — `'js-toolkit:dom:update'` — dispatched on `target` as a bubbling, **non-cancelable** `CustomEvent`.

**The detail is one object**, like every other v4 event. A decorated handler reads `{ payload: { wrap } }` for what a raw listener reads as `event.detail`.

## What a claim composes with

| Claim                                         | Effect                                                               |
| --------------------------------------------- | -------------------------------------------------------------------- |
| `wrap(viewTransition)`                        | the change plays as one batched native view transition               |
| `wrap((apply) => this.$write(apply).promise)` | the change lands in the `write` phase, batched, cancelled on unmount |
| `wrap(motionView)`                            | any object with `update(mutate)` — which `MotionView` already is     |

**Neither runner is the default.** The ancestor chooses the lane, because it knows whether the region animates.

## The rules

- **`defaultPrevented` is ignored.** The step is announced, not proposed.
- **The last claim wins.** Take-over mode keeps one runner.
- **A registration is valid only while the event dispatches.** A listener that keeps `wrap` and calls it later is reported as `protocol.late-registration` and ignored.
- **The work of the emitter always completes.** A runner that throws, rejects, or resolves without calling `apply` loses the animation, never the change — and that last case is reported as `protocol.unapplied-dom-update`.
- **An unclaimed `domUpdate()` is synchronous.** With no listener, the mutation runs before the returned promise exists.
- A failing runner is reported as `callback.dom-update-runner-failed`.

## It has no `Base` path

The helper dispatches its own event and is absent from `$emits`, so the negotiation code and the optional view-transition import stay out of the `Base` module graph. **Plain DOM code uses the same function with no instance.**

## With `swap()`

`domUpdate()` produces exactly the `wrap` that [`swap()`](./swap.html) takes, and nothing else. Resilience policy stays here.
