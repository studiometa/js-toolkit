import { EVENTS } from './events.js';
import { getSharedRuntimeSlot } from './shared-runtime.js';
import type { Base, LifecycleEventDetail } from './Base.js';

/**
 * What one `$watchChildren()` collection asks of the shared listener: drop the
 * instance from the collection when it is one of the children being watched.
 */
export type ChildrenWatcher = (instance: Base) => void;

interface ChildrenWatcherRuntimeState {
  watcherIndex: Set<WeakRef<ChildrenWatcher>>;
  isDestroyListenerAttached: boolean;
}

const watcherState = /* @__PURE__ */ getSharedRuntimeSlot<ChildrenWatcherRuntimeState>(
  'children-watchers',
  1,
  () => ({
    watcherIndex: new Set(),
    isDestroyListenerAttached: false,
  }),
);
const { watcherIndex } = watcherState;

// A watcher closes over its owner's callbacks, so it reaches the owning
// instance. The index therefore holds weak references only: a listener on
// `document` outlives every component, and a strong entry here would make the
// document keep every instance that ever watched its children alive for the
// life of the page. The owner holds its own watchers strongly, which is what
// decides when one dies.

/**
 * Tell every live watcher about a destroyed instance, and forget the watchers
 * whose owner has been collected. Pruning happens here because a discarded
 * watcher has no teardown to run: its owner simply stopped existing.
 */
function onComponentDestroyed(event: Event): void {
  const { instance } = (event as CustomEvent<LifecycleEventDetail>).detail;
  // Snapshot because a callback can add or release a watcher, and because dead
  // references are deleted during this pass.
  // oxlint-disable-next-line no-useless-spread
  for (const ref of [...watcherIndex]) {
    const watcher = ref.deref();
    if (!watcher) {
      watcherIndex.delete(ref);
      continue;
    }
    watcher(instance);
  }
}

/**
 * Route destroyed instances to one watcher.
 *
 * Destroyed events are dispatched from `document`, because the element of a
 * destroyed instance can already be detached. One lazy, shared listener serves
 * every watcher in this realm and every evaluated copy of the package, so the
 * number of listeners on the document does not grow with the number of
 * watchers.
 *
 * @returns The function releasing this watcher.
 */
export function registerChildrenWatcher(watcher: ChildrenWatcher): () => void {
  const ref = new WeakRef(watcher);
  watcherIndex.add(ref);

  if (!watcherState.isDestroyListenerAttached) {
    watcherState.isDestroyListenerAttached = true;
    document.addEventListener(EVENTS.component.destroyed, onComponentDestroyed);
  }

  return () => {
    watcherIndex.delete(ref);
  };
}
