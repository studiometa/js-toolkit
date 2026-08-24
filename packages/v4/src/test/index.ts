/**
 * Test helpers for components built on `@studiometa/js-toolkit-v4`.
 *
 * Published as `@studiometa/js-toolkit-v4/test`, and deliberately free of any
 * test framework: nothing here imports a runner, an assertion library or a
 * spy. The module reads the DOM and the framework's own scheduler only, so the
 * same helpers work under Vitest, under Playwright and on a plain browser page.
 *
 * What it answers is the one question every test of a component asks and no
 * consumer can derive: *has this component mounted, and has it finished its
 * writes?* Mounting is observer-driven and writes are scheduled in lanes, so
 * the answer is a specific interleaving of timers and scheduler idles rather
 * than a single `await`. {@link settle} is that interleaving, and every other
 * helper is built on it.
 */

import { defaultScheduler, nextFrame } from '../scheduler.js';

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
