import {
  FRAMEWORK_ATTRIBUTES,
  isComponentAttribute,
  isNetChange,
  REF_ATTRIBUTE,
  rememberPreviousValue,
} from './attributes.js';
import { reportDiagnostic } from './diagnostics.js';
import { defaultScheduler, type ScheduledTask } from './scheduler.js';
import { getSharedRuntimeSlot } from './shared-runtime.js';

export interface DOMMutationRecord {
  record: MutationRecord;
  /** Removed subtree membership at observer delivery, before background work. */
  removedSubtrees: ReadonlyMap<Node, readonly Element[]>;
}

export type DOMMutationProcessor = (records: readonly DOMMutationRecord[]) => void;

/**
 * One attribute change on a watched element, as `watchAttributes()` reports
 * it. Values are the raw attribute strings, `null` for an absent attribute —
 * so a removal is `value: null` and an addition is `previousValue: null`.
 */
export interface AttributeChange {
  name: string;
  value: string | null;
  previousValue: string | null;
}

export type AttributeWatcher = (change: AttributeChange) => void;

interface AttributeWatcherEntry {
  el: Element;
  observer: MutationObserver;
  callback: AttributeWatcher;
  /**
   * The first old value seen per attribute in the current batch, kept under
   * the one coalescing rule declared options answer to — see
   * {@link rememberPreviousValue}.
   */
  pending: Map<string, string | null>;
}

interface DOMMutationRuntimeState {
  observedAttributes: Set<string>;
  attributeWatchers: Set<AttributeWatcherEntry>;
  observer: MutationObserver | null;
  processor: DOMMutationProcessor | null;
  processTask: ScheduledTask<void> | null;
  version: number;
  records: DOMMutationRecord[];
  lifecycleWork: Set<Promise<unknown>>;
}

const domMutationState = /* @__PURE__ */ getSharedRuntimeSlot<DOMMutationRuntimeState>(
  'dom-mutations',
  1,
  () => ({
    observedAttributes: new Set<string>(FRAMEWORK_ATTRIBUTES),
    attributeWatchers: new Set(),
    observer: null,
    processor: null,
    processTask: null,
    version: 0,
    records: [],
    lifecycleWork: new Set(),
  }),
);
const { observedAttributes, attributeWatchers, lifecycleWork } = domMutationState;

/**
 * Start the document's single mutation observer on demand.
 *
 * The attribute filter grows from fixed framework attributes and the option
 * names declared by registered components, so unrelated document writes do
 * not create mutation records.
 */
function observe(): MutationObserver {
  if (!domMutationState.observer) {
    domMutationState.observer = new MutationObserver(ingest);
    observeDocument();
  }
  return domMutationState.observer;
}

function observeDocument(): void {
  domMutationState.observer?.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [...observedAttributes],
  });
}

/**
 * Whether the engine has anything to do with an attribute.
 *
 * This is the **same set** `observeDocument()` hands the observer as its
 * `attributeFilter`, and that is the point: any module may widen the filter
 * through {@link registerDOMOptionAttributes}, and a relevance test written
 * against the framework prefixes would silently drop the records a name
 * matching neither prefix produces. Deriving both from one set makes the two
 * impossible to separate.
 *
 * @internal Exported for the spec which asserts the filter and this test agree.
 */
export function isObservedDOMAttribute(attribute: string | null): boolean {
  return attribute !== null && observedAttributes.has(attribute);
}

/** Apply one change to the observed set, draining the records it already produced. */
function updateObservedAttributes(removed: readonly string[], added: readonly string[]): void {
  if (removed.length === 0 && added.length === 0) {
    return;
  }
  // Records are classified by the vocabulary which delivered them, so what the
  // current filter produced enters the queue before the set moves under it.
  ingest(domMutationState.observer?.takeRecords() ?? []);
  for (const attribute of removed) {
    observedAttributes.delete(attribute);
  }
  for (const attribute of added) {
    observedAttributes.add(attribute);
  }
  if (domMutationState.observer) {
    observeDocument();
  }
}

/**
 * Add declared option attributes to the one observer's precise filter.
 */
export function registerDOMOptionAttributes(attributes: Iterable<string>): void {
  const added = [...attributes].filter((attribute) => !observedAttributes.has(attribute));
  updateObservedAttributes([], added);
}

/**
 * Replace one derived slice of the exact attribute filter.
 *
 * Responsive attributes use this when `setBreakpoints()` replaces the named
 * set. A name in both slices stays observed and is not disturbed.
 */
export function replaceDOMOptionAttributes(
  previous: Iterable<string>,
  next: Iterable<string>,
): void {
  const kept = new Set(next);
  const removed = [...previous].filter(
    (attribute) => !kept.has(attribute) && observedAttributes.has(attribute),
  );
  const added = [...kept].filter((attribute) => !observedAttributes.has(attribute));
  updateObservedAttributes(removed, added);
}

/**
 * Observe all attributes of one element without observing its descendants.
 * An element-scoped observer is required because `MutationObserver.attributeFilter` has no wildcard.
 * Changes are coalesced and delivered after framework reconciliation through the shared queue.
 *
 * @param el The element to observe.
 * @param callback Called once per coalesced attribute change.
 * @returns An idempotent cleanup function.
 */
export function watchAttributes(el: Element, callback: AttributeWatcher): () => void {
  const entry: AttributeWatcherEntry = {
    el,
    callback,
    pending: new Map(),
    observer: new MutationObserver((incoming) => ingestWatchedAttributes(entry, incoming)),
  };
  entry.observer.observe(el, { attributes: true, attributeOldValue: true });
  attributeWatchers.add(entry);

  return () => {
    if (!attributeWatchers.delete(entry)) {
      return;
    }
    entry.observer.disconnect();
    entry.pending.clear();
  };
}

function ingestWatchedAttributes(
  entry: AttributeWatcherEntry,
  incoming: readonly MutationRecord[],
): void {
  for (const { attributeName, oldValue } of incoming) {
    if (attributeName !== null) {
      rememberPreviousValue(entry.pending, attributeName, oldValue);
    }
  }
  scheduleProcessing();
}

function hasWatchedAttributes(): boolean {
  for (const { pending } of attributeWatchers) {
    if (pending.size > 0) {
      return true;
    }
  }
  return false;
}

/**
 * Move every element observer's pending records into the shared queue, so a
 * caller draining the document — `whenDOMSettled()` — cannot return while an
 * observer still holds an undelivered change.
 */
function takeWatchedAttributes(): void {
  for (const entry of attributeWatchers) {
    ingestWatchedAttributes(entry, entry.observer.takeRecords());
  }
}

/**
 * Report coalesced changes using the final DOM value; omit net-zero changes.
 */
function deliverWatchedAttributes(): void {
  // A callback may end a subscription mid-flush: `Set` iteration skips an
  // entry deleted before it is reached, which is the wanted behaviour, and a
  // watcher subscribed from a callback has nothing pending to report yet.
  for (const entry of attributeWatchers) {
    if (entry.pending.size === 0) {
      continue;
    }
    const changes = entry.pending;
    entry.pending = new Map();
    for (const [name, previousValue] of changes) {
      // The callback just run may have ended this very subscription.
      if (!attributeWatchers.has(entry)) {
        break;
      }
      const value = entry.el.getAttribute(name);
      if (!isNetChange(value, previousValue)) {
        continue;
      }
      try {
        entry.callback({ name, value, previousValue });
      } catch (error) {
        reportDiagnostic(
          'callback.attribute-watcher-failed',
          `The attribute watcher callback for "${name}" failed.`,
          error,
          { target: entry.el },
        );
      }
    }
  }
}

/**
 * Retain records before scheduling their processing. This is also used by
 * synchronous DOM reads after `takeRecords()`, so reading a ref can never
 * steal component-registry work from the observer callback.
 */
function ingest(incoming: MutationRecord[]): void {
  const relevant = incoming.filter(
    ({ type, attributeName }) => type === 'childList' || isObservedDOMAttribute(attributeName),
  );
  if (relevant.length === 0) {
    return;
  }

  if (
    relevant.some(
      ({ type, attributeName }) =>
        type === 'childList' ||
        isComponentAttribute(attributeName) ||
        attributeName === REF_ATTRIBUTE,
    )
  ) {
    domMutationState.version += 1;
  }

  // Before the first component is registered, the current document scan is
  // sufficient. Keeping historical records here would retain detached
  // subtrees with nobody able to process them.
  if (!domMutationState.processor) {
    return;
  }
  domMutationState.records.push(
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
  if (domMutationState.processTask) {
    return;
  }
  const hasFrameworkWork =
    Boolean(domMutationState.processor) && domMutationState.records.length > 0;
  if (!hasFrameworkWork && !hasWatchedAttributes()) {
    return;
  }

  domMutationState.processTask = defaultScheduler.background(() => {
    const batch = domMutationState.records;
    domMutationState.records = [];
    domMutationState.processor?.(batch);
    // Lifecycle and declared options must run before attribute watchers.
    deliverWatchedAttributes();
  });
  const finished = () => {
    domMutationState.processTask = null;
    scheduleProcessing();
  };
  void domMutationState.processTask.promise.then(finished, finished);
}

/**
 * Install the one core processor which owns component lifecycle ordering.
 */
export function setDOMMutationProcessor(next: DOMMutationProcessor): void {
  domMutationState.processor ??= next;
  const currentObserver = observe();
  // Reconcile pending declarations before the registration scan can enqueue
  // mounts for their final token set.
  ingest(currentObserver.takeRecords());
  scheduleProcessing();
}

/**
 * Return the component lookup version after retaining pending records for registry processing.
 */
export function domVersion(): number {
  ingest(observe().takeRecords());
  return domMutationState.version;
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
    takeWatchedAttributes();
    scheduleProcessing();

    const pending = [
      ...(domMutationState.processTask ? [domMutationState.processTask.promise] : []),
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
    takeWatchedAttributes();
    scheduleProcessing();

    if (
      !domMutationState.processTask &&
      lifecycleWork.size === 0 &&
      (!domMutationState.processor || domMutationState.records.length === 0) &&
      !hasWatchedAttributes()
    ) {
      return;
    }
  }
}
