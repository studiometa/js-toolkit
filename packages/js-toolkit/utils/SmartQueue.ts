import { Queue } from './Queue.js';
import { nextTick } from './nextTick.js';

/**
 * A task is considered long if it blocks the main thread for more thant 50ms.
 * By using 40ms as a limit, we make the bet that we can avoid long running
 * tasks by dispatching small tasks smartly.
 *
 * @link https://developer.mozilla.org/en-US/docs/Glossary/Long_task
 */
const LONG_TASK_DURATION = 40;

/**
 * Manage tasks in a smart queue.
 * Tasks will be automatically batch-called inside a single event loop
 * lasting no more than 50ms, which is considered a long task.
 */
export class SmartQueue extends Queue {
  /**
   * A function to schedule the next batch.
   */
  waiter = nextTick;

  /**
   * Class constructor.
   */
  constructor() {
    super(Number.POSITIVE_INFINITY, nextTick);
  }

  /**
   * Flush current batch.
   */
  flush() {
    try {
      this.run(this.tasks);
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
    const start = performance.now();
    let now = start;
    // eslint-disable-next-line no-cond-assign
    while (now - start < LONG_TASK_DURATION && (task = tasks.shift())) {
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
      now = performance.now();
    }
  }
}
