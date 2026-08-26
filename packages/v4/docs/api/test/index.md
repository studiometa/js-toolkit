# Test helpers

```js
import { mount, settle, waitFor } from '@studiometa/js-toolkit/test';
```

Nine helpers a component test cannot write for itself.

[[toc]]

## Why the subpath exists

**The timing recipe is not derivable.** "Has this component mounted and finished its writes?" is answered by five rounds of a 10 ms timer followed by `defaultScheduler.whenIdle()`, and those two numbers encode the mount observer's delivery latency and the scheduler's lane order.

Neither half works alone: `whenIdle()` can resolve before the observer has reported the element, and a timer can return between two lanes. `defaultScheduler` and `nextFrame` were already public, so the pieces shipped and the recipe did not.

**It depends on no test framework.** Nothing in the module imports a runner, an assertion library or a spy; it reads the DOM and the scheduler only, so it runs under Vitest, under Playwright and on a plain browser page. That is also why it is not on the root barrel: a page has no use for it, and the root export count stays what it was.

## `mount()`

```ts
mount(html: string): Promise<HTMLElement>
```

Inserts the markup and resolves once the eager components have mounted.

```js
const root = await mount(`
  <button data-component="Counter">
    <span data-ref="output">0</span>
  </button>
`);
```

**It returns the wrapper `div` it created**, never the markup's own root, so a fragment of several siblings works and `querySelector()` has a stable handle. `.firstElementChild` is one property away.

## `settle()`

```ts
settle(): Promise<void>
```

Resolves once the framework has caught up — the same recipe `mount()` uses.

::: warning Not for a transition's end state
`settle()` is generous rather than deterministic. See [Transitions](#transitions) below.
:::

## `frames()`

```ts
frames(count?: number): Promise<void>
```

Awaits animation frames. `nextFrame()` with a count.

## `waitFor()`

```ts
waitFor<T>(predicate: () => T | false | null | undefined, options?: { timeout?: number; message?: string }): Promise<T>
```

Polls until the predicate is truthy and **returns that value**, which makes the same call either a guard or a query:

```js
// a guard
await waitFor(() => el.classList.contains('is-open'));

// a query
const panel = await waitFor(() => root.querySelector('.panel'));
```

It polls on a **10 ms cadence and drains the scheduler between attempts**. On timeout it throws — with the caller's `message`, or one naming the timeout.

## `captureDiagnostics()`

```ts
captureDiagnostics(target?: EventTarget): { codes: string[]; entries: ToolkitDiagnosticDetail[]; stop(): void }
```

```js
const diagnostics = captureDiagnostics();
// … exercise the component
expect(diagnostics.codes).toContain('ref.mismatch');
diagnostics.stop();
```

**It reads the channel, and asserting on `console.warn` does not.** A recovered failure is reported on a cancelable event whose _default behaviour_ is the console line; a spy on that line cannot see the code, the severity or the reporting component, and it passes for the wrong diagnostic.

The helper **cancels each event as it arrives**, which is the same act that suppresses the sink — so collecting and silencing are one step, not two, and no spy is involved.

`target` defaults to `document`, which sees everything a connected element reported, because diagnostics bubble and compose.

## `recordEvents()`

```ts
recordEvents(target: EventTarget, ...types: string[]): { events: { type: string; detail: unknown }[]; stop(): void }
```

```js
const recording = recordEvents(el, 'open', 'opened');

el.querySelector('button').click();

await waitFor(() => recording.events.length === 2);
expect(recording.events.map(({ type }) => type)).toEqual(['open', 'opened']);
expect(recording.events[1].detail).toEqual({ height: 120 });

recording.stop();
```

**It keeps the order and the payloads.** A component's contract is "`open` came before `opened`, and `opened` carried the height it measured", and a call-counting spy throws both away.

Recording several types into one array is the only place their **relative order** is visible. The richer `{ type, detail }` shape ships because a caller wanting names alone can map, and the reverse is impossible.

`$emit` dispatches synchronously but is almost never _called_ synchronously, so the count is awaited with `waitFor`, not read.

## `countRequestedFrames()`

```ts
countRequestedFrames(during: () => Promise<void> | void): Promise<number>
```

```js
const frames = await countRequestedFrames(async () => {
  for (let i = 0; i < 10; i += 1) el.dispatchEvent(new Event('scroll'));
  await settle();
});
expect(frames).toBeLessThan(3);
```

**It patches a global, and says so.** It swaps `globalThis.requestAnimationFrame` for a counting wrapper that forwards to the original, and restores it in a `finally` — so it comes back whether `during` returns or throws.

It is here despite the patch because the assertion it serves, "this did not schedule a frame per event", has no other seam: the framework's own scheduler makes the calls, so there is nothing of the component's for a spy to sit on.

::: danger Two concurrent calls would nest their wrappers. Do not.
:::

## `resetDom()`

```ts
resetDom(): Promise<void>
```

Empties the document body and lets the teardown run.

## `resetRegistry()`

```ts
resetRegistry(): void
```

**The inverse `registerComponent()` deliberately lacks.** A page registers once and keeps it; a test suite is the one caller for which a page-wide registry surviving `resetDom()` is wrong, and the workaround it forces is a counter minting `Widget-1`, `Widget-2`.

It is **coarse on purpose**: the element→controller map is a `WeakMap`, so it cannot be enumerated, nothing can walk it to dispose live triggers, and a `querySelectorAll()` sweep would still miss detached elements. Clearing everything works because the mutation-observer path already disposes a controller as its element leaves the DOM — **hence the call belongs after `resetDom()`**.

Two things it does not do: it cannot clear that `WeakMap`, so empty the DOM first; and it does not narrow the attribute filter the shared observer built from everything ever registered — an extra watched attribute costs a reconciliation pass that finds no owner, and nothing more.

::: danger Never in an `afterEach`
Spec files register at module top level, so this in an `afterEach` silently unregisters everything for every later test in the file. Put it in an `afterAll`, or call it and register again straight away:

```js
afterEach(async () => {
  await resetDom();
  resetRegistry();
  registerComponents(Subject, Emitter);
});
```

:::

## Transitions {#transitions}

**A transition's end state is asserted by polling, never by `settle()`.** A method that starts a transition does not hand it back, and a kept end state lands only after `nextFrame()`, the `from` and `active` states, and either a `transitionend` or one more frame. `settle()` is generous rather than deterministic, which is a flake that passes alone and fails under load.

**Polling for an _absence_ is wrong** for the mirror-image reason: `leaveTransition()` clears the other direction's `to` state synchronously, so the poll passes before anything has happened.

## What is deliberately not in it

An instance lookup — [`getInstance()`](/api/registry/getInstance.html) and [`getInstances()`](/api/registry/getInstances.html) on the root barrel answer it — fetch stubs, and pointer sequences. Each is either specific to one spec or already served by `vi.fn()` and `@vitest/browser`'s `userEvent`.

## A full example

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
