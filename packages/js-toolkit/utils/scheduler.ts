import { Queue } from './Queue.js';
import type { Task } from './Queue.js';

const resolvedPromise = Promise.resolve();
function waiter(cb) {
  return resolvedPromise.then(cb);
}

class Scheduler extends Queue {
  steps: Record<string, Array<Task>>;

  stepNames: string[];

  constructor(steps) {
    super(waiter)
    this.stepNames = steps;
    this.steps = Object.fromEntries(steps.map(step => [step, []]));

    steps.forEach(step => {
      this[step] = function add(task:Task) {
        this.addToStep(step, task);
      }
    });
  }

  addToStep(step:string, task: (...args: unknown[]) => unknown) {
    this.steps[step].push(task);
    this.scheduleFlush();
  }

  /**
   * Flush registered tasks and schedule the next run if needed.
   */
  flush() {
    this.stepNames.forEach((step) => {
      this.run(this.steps[step]);
    });
    this.isScheduled = false;

    if (this.stepNames.reduce((length, step) => length + this.steps[step].length, 0) > 0) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define, no-use-before-define
      this.scheduleFlush();
    }
  }
}

const instances = new Map();

const domSchedulerSteps = ['read', 'write', 'afterWrite'];

/**
 * Use a scheduler based on the given steps.
 */
export function useScheduler<T extends string>(
  steps: T[] = domSchedulerSteps as T[],
): Scheduler & Record<T, (task: Task) => void> {
  const key = steps.join('-');

  if (instances.has(key)) {
    return instances.get(key);
  }

  const scheduler = new Scheduler(steps);
  instances.set(key, scheduler);

  // @ts-ignore
  return scheduler;
}

export const domScheduler = useScheduler(domSchedulerSteps as ['read', 'write', 'afterWrite']);
