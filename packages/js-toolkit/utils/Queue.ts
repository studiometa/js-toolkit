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
          // Containing the throw here is what keeps the queue alive: left to
          // escape, it would abort `run()` mid-batch, orphan the remaining
          // tasks and leave `isScheduled` stuck `true`, wedging the queue for
          // good. Rejecting the returned promise also makes a synchronous throw
          // behave exactly like an `async` task whose promise rejects.
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
      // `waiter` is a public constructor parameter, so a faulty scheduler is
      // reachable. Reset the flag before re-throwing: stuck `true`, it would
      // make every later `scheduleFlush()` early-return and never re-arm a
      // flush. The task `add()` just pushed stays queued on purpose — it runs on
      // the next flush that does get scheduled, and its promise never reached
      // the caller (the throw pre-empts `add()`'s `return`), so rejecting it
      // here could only produce an unobservable rejection.
      this.isScheduled = false;
      throw err;
    }
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
