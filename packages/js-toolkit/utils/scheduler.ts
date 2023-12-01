/**
 * Generate a scheduler.
 */
function getScheduler<T extends string>(steps: T[]): Record<T, (fn: () => unknown) => void> {
  const stepsFns = {} as Record<T, Array<() => void>>;
  const api = {} as Record<T, (fn: () => void) => void>;

  let isScheduled = false;

  const resolvedPromise = Promise.resolve();

  /**
   * Execute the given list of tasks.
   */
  function run(tasks: Array<() => void>) {
    let task;
    // eslint-disable-next-line no-cond-assign
    while ((task = tasks.shift())) {
      task();
    }
  }

  /**
   * Flush registered tasks and schedule the next run if needed.
   */
  function flush() {
    for (const step of steps) {
      run(stepsFns[step]);
    }
    isScheduled = false;

    if (steps.reduce((length, step) => length + stepsFns[step].length, 0) > 0) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define, no-use-before-define
      scheduleFlush();
    }
  }

  /**
   * Schedule the next flush of tasks.
   */
  function scheduleFlush() {
    if (isScheduled) {
      return;
    }

    isScheduled = true;
    resolvedPromise.then(flush);
  }

  for (const step of steps) {
    stepsFns[step] = [];
    api[step] = function add(fn) {
      stepsFns[step].push(fn);
      scheduleFlush();
    };
  }

  return api;
}

const instances = new Map();

const domSchedulerSteps = ['read', 'write', 'afterWrite'];

/**
 * Use a scheduler based on the given steps.
 */
export function useScheduler<T extends string>(
  steps: T[] = domSchedulerSteps as T[],
): ReturnType<typeof getScheduler<T>> {
  const key = steps.join('-');

  if (instances.has(key)) {
    return instances.get(key);
  }

  const scheduler = getScheduler(steps);
  instances.set(key, scheduler);

  return scheduler;
}

export const domScheduler = useScheduler(domSchedulerSteps as ['read', 'write', 'afterWrite']);
