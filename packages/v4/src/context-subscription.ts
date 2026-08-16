import {
  cancelContextRequest,
  dispatchContextRequest,
  retainContextRequest,
  type ContextKey,
  type ContextRequest,
} from './context.js';
import { reportDiagnostic } from './diagnostics.js';
import { EVENTS } from './events.js';
import { getSharedRuntimeSlot } from './shared-runtime.js';

/**
 * What a subscribed consumer receives for every answer.
 *
 * The second argument is the same unsubscribe function returned by
 * `subscribeContext()`. Returning a function registers the teardown for the
 * answer.
 */
export type ContextCallback<T> = (value: T, unsubscribe: () => void) => void | (() => void);

/** An answered request that can be answered again. */
interface ContextSubscription {
  request: ContextRequest;
  el: Element;
  callback: ContextCallback<unknown>;
  /** The provider that answered last. `null` until the first answer. */
  providerNode: Node | null;
  value: unknown;
  hasValue: boolean;
  teardown?: () => void;
  isActive: boolean;
  ref: WeakRef<ContextSubscription>;
  unsubscribe: () => void;
}

interface ContextSubscriptionRuntimeState {
  subscriptionsByElement: WeakMap<Element, Set<ContextSubscription>>;
  subscriptionIndex: Set<WeakRef<ContextSubscription>>;
  isMountListenerAttached: boolean;
}

const subscriptionState = /* @__PURE__ */ getSharedRuntimeSlot<ContextSubscriptionRuntimeState>(
  'context-subscription',
  1,
  () => ({
    subscriptionsByElement: new WeakMap(),
    subscriptionIndex: new Set(),
    isMountListenerAttached: false,
  }),
);
const { subscriptionsByElement, subscriptionIndex } = subscriptionState;

// The weak owner map anchors a subscription to its consumer element. The
// iterable index contains only weak references, so the document listener can
// sweep subscriptions without keeping discarded consumers alive.

function reportFailure(
  subscription: ContextSubscription,
  operation: 'callback' | 'teardown',
  error: unknown,
): void {
  reportDiagnostic(
    operation === 'callback'
      ? 'callback.context-subscription-failed'
      : 'callback.context-teardown-failed',
    `A context subscription ${operation} failed.`,
    error,
    { target: subscription.el },
  );
}

function runTeardown(subscription: ContextSubscription): void {
  const { teardown } = subscription;
  subscription.teardown = undefined;
  if (!teardown) {
    return;
  }
  try {
    teardown();
  } catch (error) {
    reportFailure(subscription, 'teardown', error);
  }
}

/** Deliver one changed answer after the previous answer is fully released. */
function deliver(subscription: ContextSubscription, value: unknown, providerNode: Node | null) {
  if (!subscription.isActive) {
    return;
  }
  if (subscription.hasValue && Object.is(value, subscription.value)) {
    subscription.providerNode = providerNode;
    return;
  }

  runTeardown(subscription);
  if (!subscription.isActive) {
    return;
  }

  subscription.value = value;
  subscription.hasValue = true;
  subscription.providerNode = providerNode;

  let teardown: void | (() => void);
  try {
    teardown = subscription.callback(value, subscription.unsubscribe);
  } catch (error) {
    reportFailure(subscription, 'callback', error);
    return;
  }

  if (typeof teardown !== 'function') {
    return;
  }
  if (subscription.isActive) {
    subscription.teardown = teardown;
    return;
  }

  // The callback unsubscribed itself before it returned its teardown. The
  // teardown still belongs to that answer and must run before delivery ends.
  subscription.teardown = teardown;
  runTeardown(subscription);
}

/** Re-ask subscriptions whose nearest provider can change after this mount. */
function onComponentMounted(event: Event): void {
  const mountedEl = event.target;
  if (!(mountedEl instanceof Element) || subscriptionIndex.size === 0) {
    return;
  }

  // Snapshot because delivery can unsubscribe and dead weak references are
  // pruned during this pass.
  // oxlint-disable-next-line no-useless-spread
  for (const ref of [...subscriptionIndex]) {
    const subscription = ref.deref();
    if (!subscription) {
      subscriptionIndex.delete(ref);
      continue;
    }
    const { providerNode } = subscription;
    if (
      !subscription.isActive ||
      providerNode === mountedEl ||
      !mountedEl.contains(subscription.el) ||
      (providerNode !== null && !providerNode.contains(mountedEl))
    ) {
      continue;
    }
    dispatchContextRequest(subscription.request);
  }
}

function registerSubscription(subscription: ContextSubscription): void {
  let owned = subscriptionsByElement.get(subscription.el);
  if (!owned) {
    owned = new Set();
    subscriptionsByElement.set(subscription.el, owned);
  }
  owned.add(subscription);
  subscriptionIndex.add(subscription.ref);

  if (!subscriptionState.isMountListenerAttached) {
    subscriptionState.isMountListenerAttached = true;
    // One lazy, shared listener serves all subscribed consumers and all
    // evaluated copies in this realm.
    document.addEventListener(EVENTS.component.mounted, onComponentMounted);
  }
}

function unsubscribeSubscription(subscription: ContextSubscription): void {
  if (!subscription.isActive) {
    return;
  }
  subscription.isActive = false;
  cancelContextRequest(subscription.request);
  subscriptionsByElement.get(subscription.el)?.delete(subscription);
  subscriptionIndex.delete(subscription.ref);
  runTeardown(subscription);
}

/**
 * Subscribe to the nearest context value.
 *
 * The required callback runs synchronously for the first answer and every
 * changed answer from a nearer provider. Its teardown runs before the next
 * changed value and on unsubscribe. A provider change that supplies the same
 * value only updates provider ownership and does not restart the callback.
 *
 * @returns One unsubscribe function.
 */
export function subscribeContext<T>(
  el: Element,
  key: ContextKey<T>,
  onProvide: ContextCallback<T>,
): () => void {
  const subscription = {
    el,
    callback: onProvide as ContextCallback<unknown>,
    providerNode: null,
    value: undefined,
    hasValue: false,
    isActive: true,
  } as ContextSubscription;
  subscription.ref = new WeakRef(subscription);
  subscription.unsubscribe = () => unsubscribeSubscription(subscription);
  subscription.request = {
    el,
    key,
    subscribe: true,
    resolve: (value, providerNode) => deliver(subscription, value, providerNode),
  };

  registerSubscription(subscription);
  if (!dispatchContextRequest(subscription.request)) {
    retainContextRequest(subscription.request);
  }

  return subscription.unsubscribe;
}
