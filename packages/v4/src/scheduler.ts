/**
 * Milliseconds of `background` work allowed per frame.
 */
const FRAME_BUDGET = 8;

export type SchedulerPhase = 'idle' | 'frame' | 'read' | 'write' | 'afterWrite' | 'background';

type QueueName = 'read' | 'write' | 'afterWrite' | 'background';

/**
 * What every frame subscriber is given: the timestamp of the flush and the
 * time elapsed since the previous one.
 */
export interface FrameProps {
  time: DOMHighResTimeStamp;
  delta: number;
}

export type FrameCallback = (props: FrameProps) => void;

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
 * Frame-aligned scheduler: the framework's clock. Each flush runs one
 * `frame` fan-out followed by four phases — read → write → afterWrite →
 * background (budgeted).
 *
 * - One flush per frame, at `requestAnimationFrame`.
 * - A task scheduled during its own phase runs in the same frame.
 * - A task scheduled for an already-flushed phase waits for the next frame,
 *   so a `read` requested from a `write` never forces synchronous layout.
 * - Every task gets a cancelable handle whose promise resolves with the
 *   task's return value.
 * - A throwing task is reported and dropped; the flush continues.
 * - No frame is requested while there is nothing to do: the loop wakes on
 *   the first scheduled task or frame subscription and stops with the last.
 */
export class Scheduler {
  #queues: Record<QueueName, QueueItem[]> = {
    read: [],
    write: [],
    afterWrite: [],
    background: [],
  };

  #phase: SchedulerPhase = 'idle';

  #isScheduled = false;

  #idleResolvers: Array<() => void> = [];

  #frameCallbacks = new Set<FrameCallback>();

  /** `-1` while nothing is subscribed, so the first tick reports no delta. */
  #lastFrameTime = -1;

  get phase(): SchedulerPhase {
    return this.#phase;
  }

  /**
   * Subscribe to the frame tick — the clock every continuous service runs
   * on, so none of them owns a `requestAnimationFrame` loop of its own.
   *
   * Callbacks run at the very start of the flush, before `read`, so work
   * they schedule lands in the same frame: a `useRaf()` callback measures in
   * `read` and its returned render function mutates in `write`, once, before
   * paint.
   *
   * The loop runs only while it is subscribed to. Frame subscribers are not
   * queued work, so they never keep `whenIdle()` waiting.
   *
   * @returns Unsubscribe.
   */
  frame(callback: FrameCallback): () => void {
    if (this.#frameCallbacks.size === 0) {
      this.#lastFrameTime = -1;
    }
    this.#frameCallbacks.add(callback);
    this.#schedule();
    return () => {
      this.#frameCallbacks.delete(callback);
    };
  }

  read<T>(fn: () => T): ScheduledTask<T> {
    return this.#add('read', fn);
  }

  write<T>(fn: () => T): ScheduledTask<T> {
    return this.#add('write', fn);
  }

  afterWrite<T>(fn: () => T): ScheduledTask<T> {
    return this.#add('afterWrite', fn);
  }

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
   * Idleness is about queued tasks only: a frame subscription keeps the loop
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
    this.#schedule();
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

  #flush(frameTime: DOMHighResTimeStamp): void {
    this.#isScheduled = false;
    // Wall time from the top of the flush, for the background budget only.
    const start = performance.now();

    if (this.#frameCallbacks.size > 0) {
      this.#phase = 'frame';
      const props: FrameProps = {
        time: frameTime,
        delta: this.#lastFrameTime < 0 ? 0 : frameTime - this.#lastFrameTime,
      };
      this.#lastFrameTime = frameTime;
      for (const callback of this.#frameCallbacks) {
        try {
          callback(props);
        } catch (error) {
          // Reported and skipped, never unsubscribed: a subscription is
          // owned by whoever created it, not by the frame that broke.
          console.error('[scheduler] Frame callback failed:', error);
        }
      }
    }

    for (const phase of ['read', 'write', 'afterWrite'] as const) {
      this.#phase = phase;
      const queue = this.#queues[phase];
      let item;
      while ((item = queue.shift())) {
        this.#run(item);
      }
    }

    this.#phase = 'background';
    const backgroundQueue = this.#queues.background;
    while (backgroundQueue.length > 0 && performance.now() - start < FRAME_BUDGET) {
      this.#run(backgroundQueue.shift() as QueueItem);
    }

    this.#phase = 'idle';

    const isIdle = this.#isIdle();
    if (!isIdle || this.#frameCallbacks.size > 0) {
      this.#schedule();
    }
    if (isIdle && this.#idleResolvers.length > 0) {
      const resolvers = this.#idleResolvers;
      this.#idleResolvers = [];
      for (const resolve of resolvers) {
        resolve();
      }
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
      console.error('[scheduler] Task failed:', error);
      item.reject(error);
    }
  }
}

export const scheduler = new Scheduler();

/**
 * Await the next animation frame.
 */
export function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
