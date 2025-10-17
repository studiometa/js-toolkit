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
   * Run the queue.
   */
  run(tasks: Array<(...args: unknown[]) => unknown>) {
    let task;
    const start = performance.now();
    let now = start;
    // eslint-disable-next-line no-cond-assign
    while (now - start < LONG_TASK_DURATION && (task = tasks.shift())) {
      task();
      now = performance.now();
    }
  }
}
