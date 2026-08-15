import { reportDiagnostic } from './diagnostics.js';
import { getSharedRuntimeSlot } from './shared-runtime.js';

/** Background work budget per turn, measured from the drain start. */
const BACKGROUND_BUDGET = 5;

/** Clamp frame deltas to prevent jumps after long pauses. */
const MIN_DELTA = 1;
const MAX_DELTA = 40;

/** The first tick uses one 60 Hz frame because no prior timestamp exists. */
const DEFAULT_DELTA = 1000 / 60;

export type SchedulerPhase = 'idle' | 'tick' | 'read' | 'write' | 'background';

type QueueName = 'read' | 'write' | 'background';

/** Queued frame phases in execution order. */
const FRAME_PHASES = ['read', 'write'] as const;

/** Frame timestamp and elapsed time clamped to `[1, 40]` ms. */
export interface TickProps {
  readonly time: DOMHighResTimeStamp;
  readonly delta: number;
}

export type TickCallback = (props: TickProps) => void;

/** Pending background turns, and the port that runs them. */
const turns: Array<() => void> = [];
let channel: MessageChannel | undefined;

/** Post background work through `scheduler.postTask`, with a `MessageChannel` fallback. */
function postMessageTask(run: () => void): void {
  // Open the channel lazily so importing the module does not open a port.
  if (!channel) {
    channel = new MessageChannel();
    channel.port1.onmessage = () => turns.shift()?.();
  }
  turns.push(run);
  channel.port2.postMessage(null);
}

function postBackgroundTask(run: () => void): void {
  // Use the platform scheduler, not this module's scheduler.
  const nativeScheduler = globalThis.scheduler;
  if (typeof nativeScheduler?.postTask === 'function') {
    nativeScheduler.postTask(run, { priority: 'background' }).catch((error: unknown) => {
      reportDiagnostic(
        'scheduler.background-post-failed',
        'The native scheduler rejected a background post.',
        error,
      );
      postMessageTask(run);
    });
    return;
  }

  postMessageTask(run);
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
 * Frame-aligned scheduler with `tick → read → write` phases and an off-frame background lane.
 *
 * Tasks added to the active or completed phase wait for the next frame. Writes added during reads run in the same frame. Background work never requests a frame.
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
   * Subscribe before the read phase. Tick subscribers do not keep `whenIdle()` pending.
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

  /** Schedule time-sliced low-priority work outside animation frames. */
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
    // Preserve the rAF timestamp for all callbacks in this frame.
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
          reportDiagnostic(
            'callback.scheduler-tick-failed',
            'A scheduler tick callback failed.',
            error,
          );
        }
      }
    }

    // Swap each phase queue before execution to prevent same-phase reentry.
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
      // The task's promise keeps the original rejection for its owner. The
      // diagnostic reports the recovered scheduler failure independently.
      reportDiagnostic('callback.scheduled-task-failed', 'A scheduled task failed.', error);
      item.reject(error);
    }
  }
}

export const defaultScheduler = /* @__PURE__ */ getSharedRuntimeSlot(
  'scheduler:default',
  1,
  () => new Scheduler(),
);

/** Await the next animation frame. */
export function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
