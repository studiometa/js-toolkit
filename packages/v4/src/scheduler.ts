import { getSharedRuntimeSlot } from './shared-runtime.js';

/**
 * Milliseconds of `background` work allowed per turn, measured from the
 * start of the drain — never from the start of a frame, which would charge
 * rendering work against the lane meant to run beside it.
 */
const BACKGROUND_BUDGET = 5;

/**
 * Bounds for `TickProps.delta`, in milliseconds.
 *
 * An unclamped delta is a wall-clock measurement, and wall clock includes
 * everything a frame is not: a backgrounded tab, a long task, an iOS scroll
 * pause. A subscriber integrating it — every animation does — jumps by the
 * whole gap. Clamping trades exactness for continuity, which is what an
 * animation wants; every comparable library makes the same trade (Motion
 * `[1, 40]`, framesync `40`, rafz `64`, GSAP's `lagSmoothing`).
 */
const MIN_DELTA = 1;
const MAX_DELTA = 40;

/**
 * The delta reported for the first tick after the loop wakes: there is no
 * previous frame to measure against, and one 60 Hz frame is the honest
 * guess. `0` would freeze anything that multiplies by it on its first tick.
 */
const DEFAULT_DELTA = 1000 / 60;

export type SchedulerPhase = 'idle' | 'tick' | 'read' | 'write' | 'background';

type QueueName = 'read' | 'write' | 'background';

/**
 * The queued phases flushed inside the animation frame, in order. `tick` is
 * a fan-out to subscribers rather than a queue, so it is not one of them.
 */
const FRAME_PHASES = ['read', 'write'] as const;

/**
 * What every tick subscriber is given: the frame's own timestamp and the
 * time elapsed since the previous frame, clamped to `[1, 40]` ms.
 */
export interface TickProps {
  readonly time: DOMHighResTimeStamp;
  readonly delta: number;
}

export type TickCallback = (props: TickProps) => void;

/** Pending background turns, and the port that runs them. */
const turns: Array<() => void> = [];
let channel: MessageChannel | undefined;

/**
 * Run a callback outside the animation frame, at the lowest priority the
 * platform offers.
 *
 * `scheduler.postTask({ priority: 'background' })` is the native spelling.
 * The fallback is a `MessageChannel` message rather than `setTimeout`,
 * whose nested-timeout clamping (4 ms after five levels) would cap the lane
 * at a couple of hundred turns per second — the reason React's scheduler
 * moved off timers too (facebook/react#16214, "Yield many times per frame,
 * no rAF"). `isInputPending` is deliberately not consulted: the guidance to
 * use it has been retracted.
 */
function postBackgroundTask(run: () => void): void {
  // The global `scheduler` object, not this module's export — hence the
  // explicit `globalThis`.
  const nativeScheduler = globalThis.scheduler;
  if (typeof nativeScheduler?.postTask === 'function') {
    nativeScheduler.postTask(run, { priority: 'background' }).catch((error: unknown) => {
      reportError(error);
    });
    return;
  }

  // Opened on demand, never at module scope: importing the framework must
  // not open a port.
  if (!channel) {
    channel = new MessageChannel();
    channel.port1.onmessage = () => turns.shift()?.();
  }
  turns.push(run);
  channel.port2.postMessage(null);
}

/**
 * Cancelable handle returned for every scheduled task. The promise resolves
 * with the task's return value, or `undefined` when the task was canceled.
 */
export interface ScheduledTask<T = unknown> {
  promise: Promise<T | undefined>;
  cancel(): void;
}

interface QueueItem {
  fn: () => unknown;
  isCanceled: boolean;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

/**
 * Frame-aligned scheduler: the framework's clock.
 *
 * Three phases run inside the animation frame — **tick → read → write** —
 * and one lane, **background**, runs between frames on its own turns.
 *
 * ```
 * frame start (rAF)
 *   tick   — fan-out to the clock's subscribers
 *   read   — measure: layout reads only
 *   write  — mutate: DOM writes only
 * style / layout / paint
 *
 * between frames
 *   background — time-sliced, off-frame lane
 * ```
 *
 * There is no phase after `write`: the whole flush runs in a
 * `requestAnimationFrame` callback, which the HTML "update the rendering"
 * steps place *before* style, layout and paint, so nothing scheduled in the
 * frame can observe post-layout geometry. The only in-frame hook that can
 * is a `ResizeObserver` callback, which those steps run after layout;
 * anything else measures in the next frame's `read`.
 *
 * - One flush per frame, at `requestAnimationFrame`.
 * - A task scheduled for a phase that has not run yet in this flush runs in
 *   the same frame: a `write` requested from a `read` mutates before paint.
 * - A task scheduled for the phase that is currently running, or for one
 *   already flushed, waits for the next frame — so a `read` requested from
 *   a `write` never forces synchronous layout, and a phase can never
 *   re-enter itself without end.
 * - Every task gets a cancelable handle whose promise resolves with the
 *   task's return value.
 * - A throwing task is reported and dropped; the flush continues.
 * - No frame is requested while there is nothing to do: the loop wakes on
 *   the first scheduled render task or tick subscription and stops with the
 *   last. Background work alone never requests a frame.
 */
export class Scheduler {
  #queues: Record<QueueName, QueueItem[]> = {
    read: [],
    write: [],
    background: [],
  };

  #phase: SchedulerPhase = 'idle';

  #isScheduled = false;

  #isBackgroundScheduled = false;

  #idleResolvers: Array<() => void> = [];

  #tickCallbacks = new Set<TickCallback>();

  /**
   * `-1` while nothing is subscribed, so the first tick after the loop wakes
   * reports `DEFAULT_DELTA` instead of a measurement it cannot make.
   */
  #lastFrameTime = -1;

  get phase(): SchedulerPhase {
    return this.#phase;
  }

  /**
   * Subscribe to the tick — the clock every continuous service runs on, so
   * none of them owns a `requestAnimationFrame` loop of its own. It is the
   * verb the component hook (`ticked()`) and GSAP's shared clock
   * (`gsap.ticker`) already use; `nextFrame()` keeps the word *frame*,
   * because awaiting one frame is what it does.
   *
   * Callbacks run at the very start of the flush, before `read`, so work
   * they schedule lands in the same frame: a `useRaf()` callback measures in
   * `read` and its returned render function mutates in `write`, once, before
   * paint.
   *
   * The loop runs only while it is subscribed to. Tick subscribers are not
   * queued work, so they never keep `whenIdle()` waiting.
   *
   * @returns Unsubscribe.
   */
  tick(callback: TickCallback): () => void {
    if (this.#tickCallbacks.size === 0) {
      this.#lastFrameTime = -1;
    }
    this.#tickCallbacks.add(callback);
    this.#schedule();
    return () => {
      this.#tickCallbacks.delete(callback);
    };
  }

  read<T>(fn: () => T): ScheduledTask<T> {
    return this.#add('read', fn);
  }

  write<T>(fn: () => T): ScheduledTask<T> {
    return this.#add('write', fn);
  }

  /**
   * Schedule low-priority work — mounting, teardown, hydration — on its own
   * turn **between** frames, never inside one.
   *
   * A `requestAnimationFrame` callback runs before style, layout and paint,
   * so non-rendering work placed there competes with the frame it is trying
   * to stay out of the way of, whatever budget guards it. The lane posts
   * itself through `scheduler.postTask({ priority: 'background' })`, or a
   * `MessageChannel` message, and drains in time slices across as many
   * turns as the work needs.
   */
  background<T>(fn: () => T): ScheduledTask<T> {
    return this.#add('background', fn);
  }

  /**
   * Resolves once every queue is empty and no flush is scheduled.
   */
  whenIdle(): Promise<void> {
    if (this.#isIdle()) {
      return Promise.resolve();
    }
    return new Promise((resolve) => this.#idleResolvers.push(resolve));
  }

  /**
   * Idleness is about queued tasks only: a tick subscription keeps the loop
   * running forever by design, and a live service must not make
   * `whenIdle()` wait for a queue that will never be the reason it resolves.
   */
  #isIdle(): boolean {
    return Object.values(this.#queues).every((queue) => queue.length === 0);
  }

  #add<T>(queueName: QueueName, fn: () => T): ScheduledTask<T> {
    let resolve!: (value: unknown) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    // Mark the rejection as handled so callers that do not await never
    // trigger an unhandled rejection; awaiting callers still get the error.
    promise.catch(() => {});
    const item: QueueItem = { fn, isCanceled: false, resolve, reject };
    this.#queues[queueName].push(item);
    if (queueName === 'background') {
      this.#scheduleBackground();
    } else {
      this.#schedule();
    }
    return {
      promise: promise as Promise<T | undefined>,
      cancel() {
        item.isCanceled = true;
      },
    };
  }

  #schedule(): void {
    if (this.#isScheduled) {
      return;
    }
    this.#isScheduled = true;
    // The timestamp is carried through rather than re-read: it is the
    // frame's own time, identical for every callback in that frame, and it
    // is the clock the Web Animations API and `requestVideoFrameCallback`
    // are expressed in. A `performance.now()` taken once the flush starts
    // drifts against anything animating on `document.timeline`.
    requestAnimationFrame((frameTime) => this.#flush(frameTime));
  }

  #scheduleBackground(): void {
    if (this.#isBackgroundScheduled) {
      return;
    }
    this.#isBackgroundScheduled = true;
    postBackgroundTask(() => this.#drainBackground());
  }

  /**
   * One background turn: run tasks until the time slice runs out, then hand
   * the thread back and post the next turn. The slice is measured from the
   * start of the drain, so a busy frame cannot spend the lane's budget.
   */
  #drainBackground(): void {
    this.#isBackgroundScheduled = false;
    const start = performance.now();
    const queue = this.#queues.background;

    this.#phase = 'background';
    while (queue.length > 0 && performance.now() - start < BACKGROUND_BUDGET) {
      this.#run(queue.shift() as QueueItem);
    }
    this.#phase = 'idle';

    if (queue.length > 0) {
      this.#scheduleBackground();
    }
    this.#resolveIdle();
  }

  #flush(frameTime: DOMHighResTimeStamp): void {
    this.#isScheduled = false;

    if (this.#tickCallbacks.size > 0) {
      this.#phase = 'tick';
      const props: TickProps = {
        time: frameTime,
        delta: this.#clampDelta(frameTime),
      };
      this.#lastFrameTime = frameTime;
      const callbacks = [...this.#tickCallbacks];
      for (const callback of callbacks) {
        // A subscription starts on the next frame. An unsubscribe takes
        // effect at once, including before the callback's turn in this tick.
        if (!this.#tickCallbacks.has(callback)) {
          continue;
        }
        try {
          callback(props);
        } catch (error) {
          // Reported and skipped, never unsubscribed: a subscription is
          // owned by whoever created it, not by the frame that broke.
          reportError(error);
        }
      }
    }

    // Double-buffering, as Motion's render steps do it: each phase runs the
    // batch it was handed and nothing else. A task scheduled into the phase
    // that is running lands in the fresh queue and waits for the next
    // frame, which is what bounds the flush — `while (queue.shift())` let a
    // `read` scheduling a `read` re-enter without end, taking the page with
    // it. Swapping the array (rather than counting recursion, as Theatre.js
    // does) was chosen because it keeps the frame bounded without a limit
    // to tune, without warnings or throws in the caller's code, and because
    // the work still makes progress — one batch per frame — instead of
    // being aborted. It also preserves the anti-thrashing rule for free:
    // the `write` queue is taken *after* the reads have run, so a `write`
    // scheduled from a `read` is still in it and runs in the same frame.
    for (const phase of FRAME_PHASES) {
      this.#phase = phase;
      const batch = this.#queues[phase];
      this.#queues[phase] = [];
      for (const item of batch) {
        this.#run(item);
      }
    }

    this.#phase = 'idle';

    // The rAF loop exists for rendering work only. A pending background
    // task must not hold a frame open — it drains on its own turns.
    if (this.#hasFrameWork() || this.#tickCallbacks.size > 0) {
      this.#schedule();
    }
    this.#resolveIdle();
  }

  #hasFrameWork(): boolean {
    return FRAME_PHASES.some((phase) => this.#queues[phase].length > 0);
  }

  #clampDelta(frameTime: DOMHighResTimeStamp): number {
    if (this.#lastFrameTime < 0) {
      return DEFAULT_DELTA;
    }
    return Math.min(Math.max(frameTime - this.#lastFrameTime, MIN_DELTA), MAX_DELTA);
  }

  #resolveIdle(): void {
    if (this.#idleResolvers.length === 0 || !this.#isIdle()) {
      return;
    }
    const resolvers = this.#idleResolvers;
    this.#idleResolvers = [];
    for (const resolve of resolvers) {
      resolve();
    }
  }

  #run(item: QueueItem): void {
    if (item.isCanceled) {
      item.resolve(undefined);
      return;
    }
    try {
      item.resolve(item.fn());
    } catch (error) {
      // Through the platform's error channel, so an error reporter sees it;
      // `console.error()` reaches nobody but an open console. The task's
      // promise is rejected too, for whoever awaited it.
      reportError(error);
      item.reject(error);
    }
  }
}

export const defaultScheduler = /* @__PURE__ */ getSharedRuntimeSlot(
  'scheduler:default',
  1,
  () => new Scheduler(),
);

/**
 * Await the next animation frame.
 */
export function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
