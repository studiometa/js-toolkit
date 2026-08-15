import { defaultScheduler, type ScheduledTask } from './scheduler.js';

export interface DOMMutationRecord {
  record: MutationRecord;
  /** Removed subtree membership at observer delivery, before background work. */
  removedSubtrees: ReadonlyMap<Node, readonly Element[]>;
}

export type DOMMutationProcessor = (records: readonly DOMMutationRecord[]) => void;

/**
 * One attribute change on a watched element, as `$watchAttributes()` reports
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
   * The first old value seen per attribute in the current batch. Same-batch
   * writes coalesce against the final DOM value, exactly as declared options
   * do — a morph rewriting one attribute twice is one change.
   */
  pending: Map<string, string | null>;
}

const observedAttributes = new Set(['data-component', 'data-mount', 'data-ref']);

function isComponentAttribute(attribute: string | null): boolean {
  return attribute === 'data-component' || attribute?.startsWith('data-component:') === true;
}
const attributeWatchers = new Set<AttributeWatcherEntry>();
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
 * Replace one derived slice of the exact attribute filter.
 *
 * Responsive attributes use this when `setBreakpoints()` replaces the named
 * set. Existing records are retained before the observer is reconfigured.
 */
export function replaceDOMOptionAttributes(
  previous: Iterable<string>,
  next: Iterable<string>,
): void {
  let changed = false;
  for (const attribute of previous) {
    changed = observedAttributes.delete(attribute) || changed;
  }
  for (const attribute of next) {
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
 * Observe **every** attribute of one element, and report each change.
 *
 * The page-wide observer runs with a precise `attributeFilter` and that is
 * deliberate: without it every `class` and `style` write in the document —
 * animation churn included — would enter the queue. But `attributeFilter`
 * takes exact names and the DOM has no wildcard, so an attribute the
 * framework cannot enumerate is invisible to it. A `data-on:<event>` binding
 * is exactly that: its name is any DOM event, so no parse-time registration
 * can be complete, and an in-place rewrite (a `swap({ mode: 'morph' })`, a
 * template re-render) would leave the binding stale and silent.
 *
 * The opt-in is therefore element-scoped: one unfiltered observer for the one
 * element that asked, created here and disconnected by the returned cleanup.
 * The page pays for the components which opt in, not for the components which
 * exist.
 *
 * **Records join the shared queue.** The engine drains this observer wherever
 * it drains its own, and delivers the changes from the same background task,
 * *after* the framework has reconciled the batch. So `whenDOMSettled()` — and
 * therefore `swap()` — covers a watched attribute the way it covers a mount,
 * and a callback never runs against a half-reconciled framework state. Each
 * observer owns its own record queue, so draining it with `takeRecords()`
 * neither strands a record (the queue is emptied into the pending map) nor
 * delivers one twice (the callback is not called for records already taken).
 *
 * @param el       The element to observe. Its descendants are not observed.
 * @param callback Called once per coalesced attribute change.
 * @returns Idempotent cleanup which disconnects the observer.
 */
export function watchElementAttributes(el: Element, callback: AttributeWatcher): () => void {
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
    if (attributeName !== null && !entry.pending.has(attributeName)) {
      entry.pending.set(attributeName, oldValue);
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
 * Report the batch's coalesced attribute changes.
 *
 * The new value is read from the DOM rather than from a record, which is what
 * makes several writes to one attribute a single change, and what makes a
 * net-zero rewrite (`a` → `b` → `a`, the shape a morph produces) no change at
 * all — the same rule `$optionChanged()` follows.
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
      if (value === previousValue) {
        continue;
      }
      try {
        entry.callback({ name, value, previousValue });
      } catch (error) {
        console.error(`[base] Attribute watcher for "${name}" failed:`, error);
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
    ({ type, attributeName }) =>
      type === 'childList' ||
      isComponentAttribute(attributeName) ||
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
        type === 'childList' || isComponentAttribute(attributeName) || attributeName === 'data-ref',
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
  if (processTask) {
    return;
  }
  const hasFrameworkWork = Boolean(processor) && records.length > 0;
  if (!hasFrameworkWork && !hasWatchedAttributes()) {
    return;
  }

  processTask = defaultScheduler.background(() => {
    const batch = records;
    records = [];
    processor?.(batch);
    // One engine, one batch, one order: component lifecycle and declared
    // options first, then the attribute watchers. A component whose
    // `data-component` token was dropped in this same batch has already been
    // terminated, so its watcher was disposed and hears nothing — which is
    // the intended precedence. Nothing else in the framework reads these
    // attributes, so no framework decision can depend on a callback.
    deliverWatchedAttributes();
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
    takeWatchedAttributes();
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
    takeWatchedAttributes();
    scheduleProcessing();

    if (
      !processTask &&
      lifecycleWork.size === 0 &&
      (!processor || records.length === 0) &&
      !hasWatchedAttributes()
    ) {
      return;
    }
  }
}
