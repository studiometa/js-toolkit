import { scheduler } from './scheduler.js';

export type ViewTransitionUpdate = () => void | Promise<void>;

interface ViewTransitionItem {
  update: ViewTransitionUpdate;
  resolve: () => void;
  reject: (reason: unknown) => void;
}

let vtQueue: ViewTransitionItem[] = [];
let vtIsScheduled = false;
let vtRunning: Promise<void> | null = null;

/**
 * Run a DOM update inside a batched, native view transition.
 *
 * Updates queued in the same flush batch into a single
 * `document.startViewTransition()` call; batches are serialized behind the
 * in-flight transition. The batch flushes in the scheduler's `write` phase,
 * so it coordinates with pending writes. Falls back to running the update
 * without animation when the API is unavailable.
 *
 * @returns Resolved once the transition has finished.
 */
export function viewTransition(update: ViewTransitionUpdate): Promise<void> {
  return new Promise((resolve, reject) => {
    vtQueue.push({ update, resolve, reject });
    if (!vtIsScheduled) {
      vtIsScheduled = true;
      scheduler.write(flushViewTransitions);
    }
  });
}

async function flushViewTransitions(): Promise<void> {
  const batch = vtQueue;
  vtQueue = [];
  vtIsScheduled = false;

  if (vtRunning) {
    await vtRunning;
  }

  const runAll = async () => {
    for (const { update } of batch) {
      await update();
    }
  };

  if (typeof document.startViewTransition !== 'function') {
    try {
      await runAll();
      for (const { resolve } of batch) resolve();
    } catch (error) {
      for (const { reject } of batch) reject(error);
    }
    return;
  }

  const transition = document.startViewTransition(runAll);
  vtRunning = transition.finished.catch(() => {});
  try {
    await transition.finished;
    for (const { resolve } of batch) resolve();
  } catch (error) {
    for (const { reject } of batch) reject(error);
  } finally {
    vtRunning = null;
  }
}
