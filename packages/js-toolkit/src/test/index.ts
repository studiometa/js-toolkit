/**
 * Test helpers for components built on `@studiometa/js-toolkit`.
 *
 * Published as `@studiometa/js-toolkit/test`, and deliberately free of any
 * test framework: nothing here imports a runner, an assertion library or a
 * spy. The module reads the DOM, the framework's own scheduler and the
 * framework's own channels, so the same helpers work under Vitest, under
 * Playwright and on a plain browser page.
 *
 * The first question every test of a component asks is one no consumer can
 * derive: *has this component mounted, and has it finished its writes?*
 * Mounting is observer-driven and writes are scheduled in lanes, so the answer
 * is a specific interleaving of timers and scheduler idles rather than a single
 * `await`. {@link settle} is that interleaving, and {@link mount},
 * {@link waitFor} and {@link resetDom} are built on it.
 *
 * The rest answer the questions whose right answer is not the obvious one.
 * {@link captureDiagnostics} reads the diagnostic channel instead of the
 * console sink it happens to write to; {@link recordEvents} keeps the order and
 * the payloads a call-counting spy throws away;
 * {@link countRequestedFrames} counts the frames the framework's own scheduler
 * requested, which no seam of the component's exposes; and `resetRegistry()`
 * undoes a registration the framework has no other way to undo.
 */

import { type ToolkitDiagnosticDetail } from '../diagnostic-contract.js';
import { EVENTS } from '../events.js';
import { defaultScheduler, nextFrame } from '../scheduler.js';

// `resetRegistry()` lives next to the state it clears, which is module-private
// to the registry. It is re-exported here because a test suite is its only
// caller — see the doc comment there for where the call belongs.
export { resetRegistry } from '../registry.js';

/** Options for {@link waitFor}. */
export interface WaitForOptions {
  /** How long to poll before throwing, in milliseconds. Defaults to `1000`. */
  timeout?: number;
  /** The error message thrown on timeout. Replaces the default entirely. */
  message?: string;
}

/**
 * Wait until every pending mount and every scheduled write has landed.
 *
 * The numbers are not arbitrary and are not guessable from the outside. A
 * component mounts from a `MutationObserver` callback, which the browser
 * delivers on its own schedule rather than on the microtask that appended the
 * element; the work the component then queues is drained by the scheduler in
 * lane order, and a lane may queue into the next one. So neither half is
 * enough alone: a bare `whenIdle()` can resolve before the observer has even
 * reported the element, and a bare timer can return between two lanes. Five
 * rounds of "let the event loop turn, then drain the scheduler" cover a mount
 * that cascades into children, injections and DOM writes.
 *
 * This is the right tool for "the component is up and its writes are done". It
 * is the wrong tool for a transition's end state — see {@link waitFor}.
 */
export async function settle(): Promise<void> {
  for (let i = 0; i < 5; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10));
    await defaultScheduler.whenIdle();
  }
}

/**
 * Await a number of animation frames.
 *
 * Use it when the assertion is about frame-driven work — a `useRaf` service, a
 * `scheduler.tick()` subscriber, a transition staged one frame at a time — and
 * the number of frames is part of what is being asserted. When the number is
 * merely a guess, poll with {@link waitFor} instead.
 */
export async function frames(count = 3): Promise<void> {
  for (let i = 0; i < count; i += 1) {
    await nextFrame();
  }
}

/**
 * Count the animation frames requested while `during` runs.
 *
 * **This patches a global.** For the duration of the callback,
 * `globalThis.requestAnimationFrame` is replaced by a wrapper that increments
 * a counter and forwards to the original, and the original is put back in a
 * `finally` — so it is restored whether `during` returns or throws. Nothing
 * else observes the swap, because the wrapper calls through and returns the
 * real handle, but two overlapping calls would nest their wrappers, so do not
 * run them concurrently.
 *
 * The assertion it serves is "this did not schedule a frame per event", which
 * a spy cannot answer: the framework's own scheduler owns the calls, so there
 * is no seam of the component's to spy on. Assert the count, not the timing —
 * {@link frames} is for the timing.
 */
export async function countRequestedFrames(during: () => Promise<void> | void): Promise<number> {
  const original = globalThis.requestAnimationFrame;
  let requested = 0;
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
    requested += 1;
    return original.call(globalThis, callback);
  };
  try {
    await during();
  } finally {
    globalThis.requestAnimationFrame = original;
  }
  return requested;
}

/**
 * Render markup into a wrapper `div`, append it to the document and wait for
 * the components inside it to be mounted and settled.
 *
 * The returned element is the wrapper, never the markup's own root: it is a
 * stable handle for `querySelector()` calls and it keeps a fragment of several
 * siblings working. Reach for `.firstElementChild` when the component's own
 * element is what the test needs.
 *
 * ```ts
 * const root = await mount('<div data-component="Counter"></div>');
 * const [counter] = getInstances<Counter>('Counter', root);
 * ```
 */
export async function mount(html: string): Promise<HTMLElement> {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  await settle();
  return root;
}

/**
 * Poll a predicate until it returns something truthy, and return that value.
 *
 * It composes as both a guard and a query, because the value comes back:
 *
 * ```ts
 * await waitFor(() => button.classList.contains('is-open'));
 * const panel = await waitFor(() => root.querySelector('.panel'));
 * ```
 *
 * Any falsy result — `false`, `null`, `undefined`, and also `0` or `''` —
 * counts as "not yet". Between two attempts the helper both lets a 10ms timer
 * elapse and drains the scheduler, so it advances the framework's own work
 * instead of spinning on timers alone. On timeout it throws, with `message` if
 * one was given.
 *
 * **This is how a transition's end state is asserted.** `open()`, `close()`
 * and the `$watchChildren` callbacks *start* a transition and do not hand it
 * back, and a kept end state only lands after `nextFrame()`, the `from` and
 * `active` states, and either a `transitionend` or one more frame. A single
 * {@link settle} is generous, not deterministic: it passes on a spec run
 * alone and fails under full-suite load. So assert such a state by polling for
 * it here, or by awaiting `enter()`/`leave()` where the component returns the
 * promise.
 *
 * **The rule is asymmetric, and the asymmetry is the point.** Never poll for
 * an *absence*: `leaveTransition()` clears the other direction's `to` class
 * synchronously, before its first await, so "the class is gone" is already
 * true when nothing has happened yet and the poll passes for the wrong
 * reason. Assert a removal directly, after the awaited call that causes it.
 */
export async function waitFor<T>(
  predicate: () => T | false | null | undefined,
  { timeout = 1000, message }: WaitForOptions = {},
): Promise<T> {
  const deadline = Date.now() + timeout;

  for (;;) {
    const value = predicate();
    if (value) {
      return value;
    }
    if (Date.now() > deadline) {
      throw new Error(
        message ?? `waitFor: the predicate never returned a truthy value within ${timeout}ms.`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
    await defaultScheduler.whenIdle();
  }
}

/** What {@link captureDiagnostics} hands back. */
export interface DiagnosticCapture {
  /** The `code` of every diagnostic seen, in order. */
  codes: string[];
  /** The full detail of every diagnostic seen, in the same order. */
  entries: ToolkitDiagnosticDetail[];
  /** Detach the listener and let the default sink run again. */
  stop(): void;
}

/**
 * Collect the diagnostics reported while a test runs, and keep them off the
 * console.
 *
 * **Assert on this, not on the console.** A recovered failure is reported on a
 * cancelable event, and writing to the console is only that event's default
 * behaviour — one sink among the several a consumer may install. A test that
 * spies on `console.warn` asserts on the sink: it passes for a diagnostic
 * carrying the wrong code, it cannot see the component or the severity, and it
 * breaks when the sink's wording changes. This helper reads the channel
 * instead, so `codes` is what the framework actually reported.
 *
 * Silencing is not a separate step. Each event is cancelled as it arrives,
 * which is exactly what suppresses the default sink, so the console stays
 * clean for as long as the capture is open and no spy is needed:
 *
 * ```ts
 * const log = captureDiagnostics();
 * registerComponent(Duplicate);
 * expect(log.codes).toContain('registry.conflict');
 * log.stop();
 * ```
 *
 * `target` defaults to `document`, which sees everything: a diagnostic is
 * dispatched on the element it concerns when there is one, and it bubbles.
 * Pass an element to scope the capture to one subtree — but a diagnostic
 * reported about a detached element is dispatched on `document` instead, so a
 * scoped capture will not see it.
 *
 * `entries` carries the whole detail — `severity`, `code`, `message`, the
 * `component` name when one reported it, and `error` on an error-severity
 * entry — for the cases where the code alone is not the assertion.
 */
export function captureDiagnostics(target: EventTarget = document): DiagnosticCapture {
  const codes: string[] = [];
  const entries: ToolkitDiagnosticDetail[] = [];
  const listener = (event: Event) => {
    const { detail } = event as CustomEvent<ToolkitDiagnosticDetail>;
    codes.push(detail.code);
    entries.push(detail);
    // Cancelling is what suppresses the default console sink.
    event.preventDefault();
  };

  target.addEventListener(EVENTS.diagnostic, listener);

  return {
    codes,
    entries,
    stop() {
      target.removeEventListener(EVENTS.diagnostic, listener);
    },
  };
}

/** One event {@link recordEvents} saw. */
export interface RecordedEvent {
  type: string;
  /** The `detail` of a `CustomEvent`; `undefined` for a platform event. */
  detail: unknown;
}

/** What {@link recordEvents} hands back. */
export interface EventRecording {
  /** Every matching event seen, in delivery order. */
  events: RecordedEvent[];
  /** Detach every listener. */
  stop(): void;
}

/**
 * Record the named events reaching a target, with the payload each carried.
 *
 * The order and the payloads are the assertion a component's contract is made
 * of — that `open` came before `opened`, and that the second one carried the
 * height it measured — and neither survives a spy that only counts calls:
 *
 * ```ts
 * const log = recordEvents(root, 'open', 'opened');
 * await instance.open();
 * expect(log.events).toEqual([
 *   { type: 'open', detail: null },
 *   { type: 'opened', detail: { height: 120 } },
 * ]);
 * log.stop();
 * ```
 *
 * Recording types rather than one type keeps a sequence spanning several names
 * in one array, which is the only place their relative order is visible. A
 * caller that wants the names alone maps over the result; the reverse is not
 * possible, so the richer shape is the one that ships.
 *
 * `$emit` itself dispatches synchronously, but almost nothing calls it
 * synchronously: the emit follows a mount, a scheduled write or a transition,
 * and the call that started that chain has already returned. So **wait for the
 * count rather than reading it**, with {@link waitFor}:
 *
 * ```ts
 * const log = recordEvents(root, 'ping');
 * instance.start();
 * await waitFor(() => log.events.length === 2);
 * ```
 *
 * Because component events bubble, the target is usually the wrapper
 * {@link mount} returned rather than the component's own element — which is
 * also how a test sees the events of a child it never looked up.
 */
export function recordEvents(target: EventTarget, ...types: string[]): EventRecording {
  const events: RecordedEvent[] = [];
  const listener = (event: Event) => {
    events.push({ type: event.type, detail: (event as CustomEvent<unknown>).detail });
  };

  for (const type of types) {
    target.addEventListener(type, listener);
  }

  return {
    events,
    stop() {
      for (const type of types) {
        target.removeEventListener(type, listener);
      }
    },
  };
}

/**
 * Empty the document body and wait for the unmounts to land.
 *
 * Removing an element is observed like adding one, so the teardown a component
 * registered runs after the same delivery latency. Call it from an `afterEach`
 * hook: a component left mounted keeps its service subscriptions and leaks
 * into the next test.
 */
export async function resetDom(): Promise<void> {
  document.body.innerHTML = '';
  await settle();
}
