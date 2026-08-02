/**
 * Manage tasks in a queue.
 */
export class Queue {
  /**
   * List of tasks.
   */
  tasks: Array<(...args: unknown[]) => unknown> = [];

  /**
   * Number of tasks running in a single batch.
   */
  concurrency = 10;

  /**
   * A function to schedule the next batch.
   */
  waiter: (cb: (...args: unknown[]) => unknown) => unknown;

  /**
   * Is schedule running?
   */
  isScheduled = false;

  /**
   * Constructor.
   *
   * @param {number} concurrency Number of tasks running in a single batch.
   * @param {(cb: (...args:unknown[]) => unknown) => unknown} waiter Scheduler for the next batch execution.
   */
  constructor(
    concurrency: number,
    waiter: (cb: (...args: unknown[]) => unknown) => unknown = (cb) => cb(),
  ) {
    this.concurrency = concurrency;
    this.waiter = waiter;
  }

  /**
   * Add a task to the queue.
   */
  add(task: () => unknown) {
    const p = new Promise((resolve, reject) => {
      this.tasks.push(() => {
        try {
          resolve(task());
        } catch (err) {
          // Reject the returned promise so a synchronously-throwing task fails
          // exactly like an asynchronous one whose promise rejects — a caller
          // doing rollback in `catch` behaves the same regardless of whether the
          // task was declared `async`. The rejection is the single surfacing
          // channel for the error: do not also re-throw here, otherwise `run()`
          // would report the same error a second time via its `queueMicrotask`.
          // Fire-and-forget callers attach their own `.catch()` (see
          // `Base/utils.ts` and `ChildrenManager.ts`) so this never becomes an
          // unhandled rejection.
          reject(err);
        }
      });
    });
    this.scheduleFlush();
    return p;
  }

  /**
   * Schedule next flush.
   */
  scheduleFlush() {
    if (this.isScheduled) {
      return;
    }

    this.isScheduled = true;

    try {
      this.waiter(() => this.flush());
    } catch (err) {
      // If the scheduler itself throws, reset the flag before re-throwing so a
      // faulty `waiter` can not leave the queue permanently wedged (the flag
      // stuck `true` would make every later `scheduleFlush()` early-return and
      // never re-arm a flush).
      this.isScheduled = false;
      throw err;
    }
  }

  /**
   * Flush current batch.
   */
  flush() {
    try {
      this.run(this.tasks.splice(0, this.concurrency));
    } finally {
      // Always reset the scheduling flag and re-arm the next flush, even when a
      // task throws, so a single faulty task can not permanently wedge the queue.
      this.isScheduled = false;

      if (this.tasks.length > 0) {
        this.scheduleFlush();
      }
    }
  }

  /**
   * Run the queue.
   */
  run(tasks: Array<(...args: unknown[]) => unknown>) {
    let task;
    // eslint-disable-next-line no-cond-assign
    while ((task = tasks.shift())) {
      try {
        task();
      } catch (err) {
        // Defence in depth: tasks pushed by `add()` already isolate their own
        // errors (they reject the returned promise and never throw here), so
        // this only catches an unexpected throw. Keep draining the batch and
        // surface the error asynchronously instead of aborting the whole flush.
        queueMicrotask(() => {
          throw err;
        });
      }
    }
  }
}
