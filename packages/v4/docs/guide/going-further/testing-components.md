# Testing

`@studiometa/js-toolkit/test` ships the nine helpers a component test cannot write for itself.

[[toc]]

## Why a subpath exists

**The timing recipe is not derivable.** "Has this component mounted and finished its writes?" is answered by five rounds of a 10 ms timer followed by `defaultScheduler.whenIdle()`, and those two numbers encode the mount observer's delivery latency and the scheduler's lane order.

Neither half works alone: `whenIdle()` can resolve before the observer has reported the element, and a timer can return between two lanes. `defaultScheduler` and `nextFrame` were already public, so the pieces shipped and the recipe did not.

**It depends on no test framework.** Nothing in the module imports a runner, an assertion library or a spy; it reads the DOM and the scheduler only, so it runs under Vitest, under Playwright and on a plain browser page. That is also why it is not on the root barrel: a page has no use for it.

## A first test

```js
import { afterAll, expect, test } from 'vitest';
import { Base, registerComponent } from '@studiometa/js-toolkit';
import { mount, resetDom, resetRegistry, waitFor } from '@studiometa/js-toolkit/test';

class Counter extends Base {
  static config = { name: 'Counter', refs: ['output'] };

  count = 0;

  onClick() {
    this.count += 1;
    this.$refs.output.textContent = String(this.count);
  }
}

registerComponent(Counter);

test('it counts clicks', async () => {
  const root = await mount(`
    <button data-component="Counter">
      <span data-ref="output">0</span>
    </button>
  `);

  root.querySelector('button').click();

  await waitFor(() => root.querySelector('[data-ref="output"]').textContent === '1');
});

afterAll(async () => {
  await resetDom();
  resetRegistry();
});
```

## The helpers

| Helper                           | What it does                                                           |
| -------------------------------- | ---------------------------------------------------------------------- |
| `mount(html)`                    | inserts the markup and resolves once the eager components have mounted |
| `settle()`                       | resolves once the framework has caught up                              |
| `frames(count?)`                 | awaits animation frames                                                |
| `waitFor(predicate, options?)`   | polls until the predicate is truthy, and returns that value            |
| `countRequestedFrames(during)`   | counts the `requestAnimationFrame()` calls made during `during`        |
| `captureDiagnostics(target?)`    | collects diagnostics and silences their console output                 |
| `recordEvents(target, ...types)` | records events in order, with their payloads                           |
| `resetDom()`                     | empties the document body and lets the teardown run                    |
| `resetRegistry()`                | drops every registration                                               |

See the [full reference](/api/test/).

## `mount()` returns the wrapper

It returns the `div` it created, **never** the markup's own root, so a fragment of several siblings works and `querySelector()` has a stable handle. `.firstElementChild` is one property away.

## `waitFor()` is a guard and a query

It returns the predicate's truthy value, which makes the same call either:

```js
// a guard
await waitFor(() => el.classList.contains('is-open'));

// or a query
const panel = await waitFor(() => root.querySelector('.panel'));
```

It polls on a 10 ms cadence and drains the scheduler between attempts. On timeout it throws — with the caller's `message`, or one naming the timeout.

## Transitions: poll, never `settle()`

**A transition's end state is asserted by polling.** A method that starts a transition does not hand it back, and a kept end state lands only after `nextFrame()`, the `from` and `active` states, and either a `transitionend` or one more frame. `settle()` is generous rather than deterministic, which is a flake that passes alone and fails under load.

**Polling for an _absence_ is wrong** for the mirror-image reason: `leaveTransition()` clears the other direction's `to` state synchronously, so the poll passes before anything has happened.

## `recordEvents()` keeps the order

A component's contract is "`open` came before `opened`, and `opened` carried the height it measured", and a call-counting spy throws both away:

```js
const recording = recordEvents(el, 'open', 'opened');

el.querySelector('button').click();

await waitFor(() => recording.events.length === 2);
expect(recording.events.map(({ type }) => type)).toEqual(['open', 'opened']);
expect(recording.events[1].detail).toEqual({ height: 120 });

recording.stop();
```

Recording several types into one array is the only place their relative order is visible. `$emit` dispatches synchronously but is almost never _called_ synchronously, so the count is awaited with `waitFor`, not read.

## `resetRegistry()` — where the call belongs

It is the inverse `registerComponent()` deliberately lacks, and it is **coarse on purpose**: the element→controller map is a `WeakMap`, so nothing can walk it to dispose live triggers, and a `querySelectorAll()` sweep would still miss detached elements.

Clearing everything works because the mutation-observer path already disposes a controller as its element leaves the DOM — hence the call belongs **after** `resetDom()`.

::: danger Never in an `afterEach`
Spec files register at module top level, so `resetRegistry()` in an `afterEach` silently unregisters everything for every later test in the file. Put it in an `afterAll`, or call it and register again straight away:

```js
afterEach(async () => {
  await resetDom();
  resetRegistry();
  registerComponents(Subject, Emitter);
});
```

:::

## `countRequestedFrames()` patches a global

It swaps `globalThis.requestAnimationFrame` for a counting wrapper that forwards to the original, and restores it in a `finally` — so it comes back whether `during` returns or throws.

It is here despite the patch because the assertion it serves, "this did not schedule a frame per event", has no other seam: the framework's own scheduler makes the calls, so there is nothing of the component's for a spy to sit on.

::: warning Two concurrent calls would nest their wrappers. Do not.
:::

## What is deliberately not in it

An instance lookup — `getInstance()` and `getInstances()` on the root barrel answer it — fetch stubs, and pointer sequences. Each is either specific to one spec or already served by `vi.fn()` and `@vitest/browser`'s `userEvent`.
