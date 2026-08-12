import { scheduler, type ScheduledTask } from './scheduler.js';

export type DOMMutationProcessor = (records: readonly MutationRecord[]) => void;

let observer: MutationObserver | null = null;
let processor: DOMMutationProcessor | null = null;
let processTask: ScheduledTask<void> | null = null;
let version = 0;
let records: MutationRecord[] = [];
const lifecycleWork = new Set<Promise<unknown>>();

/**
 * Start the document's single mutation observer on demand.
 *
 * Attribute names outside this list do not affect a core DOM lookup or the
 * component registry. Open attribute families can be added when core has a
 * concrete consumer for them.
 */
function observe(): MutationObserver {
  if (!observer) {
    observer = new MutationObserver(ingest);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['data-component', 'data-mount', 'data-ref'],
    });
  }
  return observer;
}

/**
 * Retain records before scheduling their processing. This is also used by
 * synchronous DOM reads after `takeRecords()`, so reading a ref can never
 * steal component-registry work from the observer callback.
 */
function ingest(incoming: MutationRecord[]): void {
  if (incoming.length === 0) {
    return;
  }

  records.push(...incoming);
  if (
    incoming.some(
      ({ type, attributeName }) =>
        type === 'childList' || attributeName === 'data-component' || attributeName === 'data-ref',
    )
  ) {
    version += 1;
  }
  scheduleProcessing();
}

function scheduleProcessing(): void {
  if (!processor || processTask || records.length === 0) {
    return;
  }

  processTask = scheduler.background(() => {
    const batch = records;
    records = [];
    processor?.(batch);
  });
  processTask.promise.finally(() => {
    processTask = null;
    scheduleProcessing();
  });
}

/**
 * Install the one core processor which owns component lifecycle ordering.
 */
export function setDOMMutationProcessor(next: DOMMutationProcessor): void {
  processor = next;
  observe();
  scheduleProcessing();
}

/**
 * A counter bumped whenever the document changes in a way that can change a
 * component lookup or ref result.
 *
 * Pending observer records are retained for normal registry processing
 * before the version is returned. This keeps a ref read correct in the same
 * task as a DOM change without requiring a second MutationObserver.
 */
export function domVersion(): number {
  ingest(observe().takeRecords());
  return version;
}

/**
 * Track eager lifecycle work started while applying a mutation batch.
 * Conditional mount strategies deliberately do not enter this set.
 */
export function trackDOMLifecycleWork(work: Promise<unknown> | undefined): void {
  if (!work) {
    return;
  }
  lifecycleWork.add(work);
  work.finally(() => lifecycleWork.delete(work));
}

/**
 * Resolve when every mutation currently observable by core has been
 * processed and its eager lifecycle work has run.
 *
 * This does not wait for visibility, interaction, idle, or media
 * conditions, and it does not await promises returned by `mounted()`.
 */
export async function whenDOMSettled(): Promise<void> {
  const currentObserver = observe();

  while (true) {
    ingest(currentObserver.takeRecords());
    scheduleProcessing();

    const pending = [
      ...(processTask ? [processTask.promise] : []),
      ...lifecycleWork,
    ];
    if (pending.length > 0) {
      await Promise.all(pending);
      continue;
    }

    // MutationObserver delivery and lifecycle-triggered microtasks can add
    // records after the last tracked task resolves. Cross one microtask and
    // take records once more before declaring the document stable.
    await Promise.resolve();
    ingest(currentObserver.takeRecords());
    scheduleProcessing();

    if (!processTask && lifecycleWork.size === 0 && (!processor || records.length === 0)) {
      return;
    }
  }
}
