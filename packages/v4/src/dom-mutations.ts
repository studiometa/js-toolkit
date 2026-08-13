import { defaultScheduler, type ScheduledTask } from './scheduler.js';

export interface DOMMutationRecord {
  record: MutationRecord;
  /** Removed subtree membership at observer delivery, before background work. */
  removedSubtrees: ReadonlyMap<Node, readonly Element[]>;
}

export type DOMMutationProcessor = (records: readonly DOMMutationRecord[]) => void;

const observedAttributes = new Set(['data-component', 'data-mount', 'data-ref']);
let observer: MutationObserver | null = null;
let processor: DOMMutationProcessor | null = null;
let processTask: ScheduledTask<void> | null = null;
let version = 0;
let records: DOMMutationRecord[] = [];
const lifecycleWork = new Set<Promise<unknown>>();

/**
 * Start the document's single mutation observer on demand.
 *
 * The attribute filter grows from fixed framework attributes and the option
 * names declared by registered components, so unrelated document writes do
 * not create mutation records.
 */
function observe(): MutationObserver {
  if (!observer) {
    observer = new MutationObserver(ingest);
    observeDocument();
  }
  return observer;
}

function observeDocument(): void {
  observer?.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [...observedAttributes],
  });
}

/**
 * Add declared option attributes to the one observer's precise filter.
 * Existing records enter the queue before observation options change.
 */
export function registerDOMOptionAttributes(attributes: Iterable<string>): void {
  let changed = false;
  for (const attribute of attributes) {
    if (!observedAttributes.has(attribute)) {
      observedAttributes.add(attribute);
      changed = true;
    }
  }
  if (!changed || !observer) {
    return;
  }
  ingest(observer.takeRecords());
  observeDocument();
}

/**
 * Retain records before scheduling their processing. This is also used by
 * synchronous DOM reads after `takeRecords()`, so reading a ref can never
 * steal component-registry work from the observer callback.
 */
function ingest(incoming: MutationRecord[]): void {
  const relevant = incoming.filter(
    ({ type, attributeName }) =>
      type === 'childList' ||
      attributeName === 'data-component' ||
      attributeName === 'data-mount' ||
      attributeName === 'data-ref' ||
      attributeName?.startsWith('data-option-'),
  );
  if (relevant.length === 0) {
    return;
  }

  if (
    relevant.some(
      ({ type, attributeName }) =>
        type === 'childList' || attributeName === 'data-component' || attributeName === 'data-ref',
    )
  ) {
    version += 1;
  }

  // Before the first component is registered, the current document scan is
  // sufficient. Keeping historical records here would retain detached
  // subtrees with nobody able to process them.
  if (!processor) {
    return;
  }
  records.push(
    ...relevant.map((record): DOMMutationRecord => {
      const removedSubtrees = new Map<Node, readonly Element[]>();
      if (record.type === 'childList') {
        for (const node of record.removedNodes) {
          if (node instanceof Element) {
            removedSubtrees.set(node, [node, ...node.querySelectorAll('*')]);
          }
        }
      }
      return { record, removedSubtrees };
    }),
  );
  scheduleProcessing();
}

function scheduleProcessing(): void {
  if (!processor || processTask || records.length === 0) {
    return;
  }

  processTask = defaultScheduler.background(() => {
    const batch = records;
    records = [];
    processor?.(batch);
  });
  const finished = () => {
    processTask = null;
    scheduleProcessing();
  };
  void processTask.promise.then(finished, finished);
}

/**
 * Install the one core processor which owns component lifecycle ordering.
 */
export function setDOMMutationProcessor(next: DOMMutationProcessor): void {
  processor = next;
  const currentObserver = observe();
  // Reconcile pending declarations before the registration scan can enqueue
  // mounts for their final token set.
  ingest(currentObserver.takeRecords());
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
  const finished = () => lifecycleWork.delete(work);
  void work.then(finished, finished);
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

    const pending = [...(processTask ? [processTask.promise] : []), ...lifecycleWork];
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
