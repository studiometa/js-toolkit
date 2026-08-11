/**
 * Milliseconds of `background` work allowed per frame.
 */
const FRAME_BUDGET = 8;

export type SchedulerPhase = 'idle' | 'read' | 'write' | 'afterWrite' | 'background';

type QueueName = Exclude<SchedulerPhase, 'idle'>;

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
 * Frame-aligned scheduler with four phases per frame:
 * read → write → afterWrite → background (budgeted).
 *
 * - One flush per frame, at `requestAnimationFrame`.
 * - A task scheduled during its own phase runs in the same frame.
 * - A task scheduled for an already-flushed phase waits for the next frame,
 *   so a `read` requested from a `write` never forces synchronous layout.
 * - Every task gets a cancelable handle whose promise resolves with the
 *   task's return value.
 * - A throwing task is reported and dropped; the flush continues.
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

  get phase(): SchedulerPhase {
    return this.#phase;
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

  #isIdle(): boolean {
    return !this.#isScheduled && Object.values(this.#queues).every((queue) => queue.length === 0);
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
    requestAnimationFrame(() => this.#flush());
  }

  #flush(): void {
    this.#isScheduled = false;
    const start = performance.now();

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

    if (Object.values(this.#queues).some((queue) => queue.length > 0)) {
      this.#schedule();
    } else if (this.#idleResolvers.length > 0) {
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
