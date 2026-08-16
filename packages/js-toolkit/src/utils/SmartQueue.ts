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
    this.run(this.tasks);
    this.isScheduled = false;

    if (this.tasks.length > 0) {
      this.scheduleFlush();
    }
  }

  /**
   * Run as many tasks as the budget allows, then drop the ones that ran.
   *
   * `flush()` hands over the live queue, so this walks it by index and trims
   * it once instead of draining it with `Array#shift`, whose per-entry cost
   * makes a deep queue quadratic. Reading `tasks.length` on every turn keeps
   * work queued by a running task eligible for the same drain, and whatever
   * the budget leaves behind is what `flush()` reschedules.
   */
  run(tasks: Array<(...args: unknown[]) => unknown>) {
    const start = performance.now();
    let now = start;
    let index = 0;

    try {
      while (now - start < LONG_TASK_DURATION && index < tasks.length) {
        const task = tasks[index];
        index += 1;
        task();
        now = performance.now();
      }
    } finally {
      tasks.splice(0, index);
    }
  }
}
