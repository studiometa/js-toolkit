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
    const p = new Promise((resolve) => {
      this.tasks.push(() => resolve(task()));
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
    this.waiter(() => this.flush());
  }

  /**
   * Flush current batch.
   */
  flush() {
    this.run(this.tasks.splice(0, this.concurrency));
    this.isScheduled = false;

    if (this.tasks.length > 0) {
      this.scheduleFlush();
    }
  }

  /**
   * Run the given tasks in order, then drop the ones that ran from the array.
   *
   * The array is walked by index and trimmed once, rather than drained with
   * `Array#shift`: V8 moves every remaining entry on each shift, so a queue
   * handed over whole — which is what `SmartQueue` does — costs O(n²) to
   * drain. `tasks.length` is read on every turn, so work queued by a running
   * task is picked up by the same drain.
   *
   * The trim is in a `finally`: a task that throws takes itself and everything
   * before it out of the queue, and leaves the rest of the queue alone.
   */
  run(tasks: Array<(...args: unknown[]) => unknown>) {
    let index = 0;

    try {
      while (index < tasks.length) {
        const task = tasks[index];
        index += 1;
        task();
      }
    } finally {
      tasks.splice(0, index);
    }
  }
}
