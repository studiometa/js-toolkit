import { defaultScheduler } from './scheduler.js';

export type ViewTransitionUpdate = () => void | Promise<void>;

interface ViewTransitionItem {
  update: ViewTransitionUpdate;
  resolve: () => void;
  reject: (reason: unknown) => void;
}

let vtQueue: ViewTransitionItem[] = [];
let vtIsScheduled = false;
let vtTail = Promise.resolve();

/**
 * Run a DOM update inside a batched, native view transition.
 *
 * Updates queued in the same flush batch into a single
 * `document.startViewTransition()` call; batches are serialized behind the
 * promise tail. The batch flushes in the scheduler's `write` phase, so it
 * coordinates with pending writes. Falls back to running the update without
 * animation when the API is unavailable.
 *
 * @returns Resolved once the transition has finished.
 */
export function viewTransition(update: ViewTransitionUpdate): Promise<void> {
  return new Promise((resolve, reject) => {
    vtQueue.push({ update, resolve, reject });
    if (!vtIsScheduled) {
      vtIsScheduled = true;
      defaultScheduler.write(flushViewTransitions);
    }
  });
}

function flushViewTransitions(): void {
  const batch = vtQueue;
  vtQueue = [];
  vtIsScheduled = false;

  // Every flush appends one batch to the same tail. Two later flushes waiting
  // for one running transition therefore stay ordered instead of resuming
  // together when that transition finishes.
  vtTail = vtTail.then(() => runViewTransitionBatch(batch));
}

async function runViewTransitionBatch(batch: ViewTransitionItem[]): Promise<void> {
  const runAll = async () => {
    for (const { update } of batch) {
      await update();
    }
  };

  try {
    if (typeof document.startViewTransition === 'function') {
      await document.startViewTransition(runAll).finished;
    } else {
      await runAll();
    }
    for (const { resolve } of batch) resolve();
  } catch (error) {
    for (const { reject } of batch) reject(error);
  }
}
