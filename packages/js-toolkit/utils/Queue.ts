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
   * Run the queue.
   */
  run(tasks: Array<(...args: unknown[]) => unknown>) {
    let task;
    // eslint-disable-next-line no-cond-assign
    while ((task = tasks.shift())) {
      task();
    }
  }
}
