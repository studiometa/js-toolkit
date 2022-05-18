/**
 * Generate a scheduler.
 * @typedef {string} T
 * @param   {T[]} steps
 * @returns {Record<T, (fn: () => void) => void>}
 */
function getScheduler(steps) {
  /** @type {Record<T, Array<() => void>>} */
  const stepsFns = {};
  /** @type {Record<T, (fn: () => void) => void>} */
  const api = {};

  let isScheduled = false;

  /**
   * Execute the given list of tasks.
   *
   * @param   {Array<() => void>} tasks
   * @returns {void}
   */
  function run(tasks) {
    let task;
    // eslint-disable-next-line no-cond-assign
    while ((task = tasks.shift())) {
      task();
    }
  }

  /**
   * Flush registered tasks and schedule the next run if needed.
   * @returns {void}
   */
  function flush() {
    steps.forEach(function runStep(step) {
      run(stepsFns[step]);
    });
    isScheduled = false;

    if (steps.reduce((length, step) => length + stepsFns[step].length, 0) > 0) {
      // eslint-disable-next-line no-use-before-define
      scheduleFlush();
    }
  }

  /**
   * Schedule the next flush of tasks.
   * @returns {void}
   */
  function scheduleFlush() {
    if (isScheduled) {
      return;
    }

    isScheduled = true;
    requestAnimationFrame(flush);
  }

  steps.forEach((step) => {
    stepsFns[step] = [];
    api[step] = function add(fn) {
      stepsFns[step].push(fn);
      scheduleFlush();
    };
  });

  return api;
}

const instances = new Map();

/**
 * Use a scheduler based on the given steps.
 * @param   {string[]}  steps
 * @returns {ReturnType<getScheduler>}
 */
export function useScheduler(steps = ['read', 'write']) {
  const key = steps.join('-');

  if (instances.has(key)) {
    return instances.get(key);
  }

  const scheduler = getScheduler(steps);
  instances.set(key, scheduler);

  return scheduler;
}

export const domScheduler = useScheduler(['read', 'write']);
