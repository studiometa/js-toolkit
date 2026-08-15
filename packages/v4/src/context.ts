import { MOUNTED_EVENT } from './lifecycle-events.js';
import { getSharedRuntimeSlot } from './shared-runtime.js';

const CONTEXT_REQUEST = 'context-request';

/**
 * A typed context key. The phantom `__context` property carries the value
 * type so `provideContext`/`injectContext` infer it — it never exists at
 * runtime.
 */
export type ContextKey<T = unknown> = symbol & { readonly __context?: T };

/**
 * Create a typed context key.
 */
export function createContext<T = unknown>(description = 'context'): ContextKey<T> {
  return Symbol(description) as ContextKey<T>;
}

/**
 * A minimal reactive value: read/write `value`, subscribe to changes.
 * The live reference is shared, never serialized.
 */
export interface Signal<T = unknown> {
  /**
   * The current value — always the last one written, even mid-delivery.
   */
  value: T;
  /**
   * @returns Unsubscribe.
   */
  subscribe(callback: (value: T) => void, options?: { immediate?: boolean }): () => void;
}

/**
 * A subscription is a record, not the bare callback: two holders of the same
 * function must each get their own delivery and their own unsubscribe, which a
 * `Set` keyed by the callback collapsed into one. The `isActive` flag is what
 * makes removal correct while the fan-out walks a snapshot — the same pairing
 * the services use.
 */
interface Subscriber<T> {
  callback: (value: T) => void;
  isActive: boolean;
}

/**
 * Create a reactive value.
 *
 * A write is **settled synchronously** before the setter returns: subscribers
 * run in the same task, in subscription order. There is no microtask hop —
 * these signals back form-control echoes, where a deferred delivery would be a
 * visible change of behaviour.
 *
 * **A write from inside a delivery supersedes the one being delivered.** The
 * naive fan-out — assign, then walk the subscribers — re-enters itself on a
 * nested write and then carries on walking with the value it started on, so a
 * subscriber positioned after the writer is handed a frame that is already
 * stale, *after* a newer one. Last-write-wins turns into last-listener-wins.
 * So delivery is split from the value: `current` is what a reader sees,
 * `delivered` is what subscribers have been told, and the loop below re-reads
 * `current` after every callback. When it has moved, the round is abandoned and
 * restarted on the new value rather than finished on the old one — the
 * remaining subscribers skip the superseded frame entirely and every subscriber
 * ends up having last seen the newest value.
 *
 * Two consequences worth naming. A subscriber can be delivered to more than
 * once per write when a peer writes back mid-round, because it genuinely has a
 * new value to see; what is guaranteed is that no subscriber ever observes a
 * value older than one it has already been given. And a subscriber that writes
 * unconditionally on every delivery does not overflow the stack — it spins in
 * the loop instead, which is a live-lock by construction, exactly as it is for
 * any synchronous reactive graph.
 */
export function signal<T>(initialValue: T): Signal<T> {
  let current = initialValue;
  let delivered = initialValue;
  let isSettling = false;
  const subscribers = new Set<Subscriber<T>>();

  function settle() {
    // Re-entrant write: the loop already running owns the drain and picks the
    // new value up on its next turn. Draining here would nest the fan-out.
    if (isSettling) {
      return;
    }
    isSettling = true;
    try {
      while (delivered !== current) {
        delivered = current;
        // Snapshot: a subscriber added during delivery is not handed a value
        // that predates it, and one removed during delivery is skipped through
        // its `isActive` flag rather than by mutating what we iterate.
        for (const subscriber of [...subscribers]) {
          if (!subscriber.isActive) {
            continue;
          }
          subscriber.callback(delivered);
          if (current !== delivered) {
            break;
          }
        }
      }
    } finally {
      isSettling = false;
    }
  }

  return {
    get value(): T {
      return current;
    },
    set value(next: T) {
      if (next === current) {
        return;
      }
      current = next;
      settle();
    },
    subscribe(callback: (value: T) => void, { immediate = false } = {}): () => void {
      const subscriber: Subscriber<T> = { callback, isActive: true };
      subscribers.add(subscriber);
      if (immediate) {
        callback(current);
      }
      return () => {
        subscriber.isActive = false;
        subscribers.delete(subscriber);
      };
    },
  };
}

/**
 * What a subscribed consumer is handed on every answer.
 *
 * The second argument is the same `unsubscribe` the injector returned, so a
 * consumer can end its own subscription from inside a delivery. **Returning a
 * function registers the teardown for that answer** — see `deliver()` for the
 * contract it buys.
 */
export type ContextCallback<T> = (value: T, unsubscribe: () => void) => void | (() => void);

/**
 * How a consumer asks.
 */
export interface InjectContextOptions<T = unknown> {
  /**
   * Keep the request live after it has been answered, so that a **nearer
   * provider appearing later answers it again**. This is the WICG context
   * protocol's `subscribe` flag, and it is off by default: an unsubscribed
   * request is deleted the moment anything answers it, which is what a
   * control that found its coordinator wants.
   *
   * Re-answers are delivered to `onProvide` — a promise settles once, as
   * promises do — so `subscribe` without `onProvide` subscribes to nothing.
   */
  subscribe?: boolean;
  /**
   * Called for **every** answer, including the first, synchronously, with the
   * value and an `unsubscribe`. The promise still settles on the first
   * answer, so a consumer that only uses the callback can ignore it.
   */
  onProvide?: ContextCallback<T>;
}

interface ContextRequestDetail {
  key: symbol;
  /**
   * Part of the dispatched protocol, not of v4's own resolution: v4 re-asks
   * from the consumer rather than being pushed to, so its own providers do
   * not read this. A third-party provider implementing the WICG protocol
   * does, which is the reason it is on the wire.
   */
  subscribe: boolean;
  provide(value: unknown): void;
}

interface PendingRequest {
  el: Element;
  key: symbol;
  subscribe: boolean;
  /**
   * `providerNode` is whoever answered — `event.currentTarget` at the moment
   * the answer came in. It is what makes "is this new provider nearer than
   * the one I have?" a single `contains()` instead of a re-dispatch.
   */
  resolve(value: unknown, providerNode: Node | null): void;
}

function requestContext(request: PendingRequest): boolean {
  let isAnswered = false;
  let event!: CustomEvent<ContextRequestDetail>;
  const detail: ContextRequestDetail = {
    key: request.key,
    subscribe: request.subscribe,
    provide(value) {
      isAnswered = true;
      // Answered means no longer *pending*, for a subscribed request too: what
      // keeps it re-askable is the subscription index below, not this set.
      pendingRequests.delete(request);
      const provider = event.currentTarget;
      request.resolve(value, provider instanceof Node ? provider : null);
    },
  };
  event = new CustomEvent(CONTEXT_REQUEST, { bubbles: true, detail });
  request.el.dispatchEvent(event);
  return isAnswered;
}

/**
 * An answered request that is still allowed to be answered again.
 */
interface ContextSubscription {
  request: PendingRequest;
  el: Element;
  callback?: ContextCallback<unknown>;
  /** Whoever answered last. `null` until the first answer. */
  providerNode: Node | null;
  value: unknown;
  hasValue: boolean;
  teardown?: () => void;
  isActive: boolean;
  ref: WeakRef<ContextSubscription>;
  unsubscribe(): void;
}

interface ContextRuntimeState {
  pendingRequests: Set<PendingRequest>;
  subscriptionsByElement: WeakMap<Element, Set<ContextSubscription>>;
  subscriptionIndex: Set<WeakRef<ContextSubscription>>;
  isMountListenerAttached: boolean;
  rootProviders: Map<symbol, unknown>;
}

const contextState = /* @__PURE__ */ getSharedRuntimeSlot<ContextRuntimeState>(
  'context',
  1,
  () => ({
    pendingRequests: new Set(),
    subscriptionsByElement: new WeakMap(),
    subscriptionIndex: new Set(),
    isMountListenerAttached: false,
    rootProviders: new Map(),
  }),
);
const { pendingRequests, subscriptionsByElement, subscriptionIndex, rootProviders } = contextState;

/**
 * The subscription registry, in two halves, because it has two jobs that pull
 * in opposite directions: it must be **iterable** on every mount, and it must
 * **hold nothing**.
 *
 * - `subscriptionsByElement` anchors a subscription's lifetime to its consumer
 *   element and nothing else. A subscription references its element, the
 *   element's entry references the subscription back, and the cycle is
 *   reachable from this module only weakly — so a discarded element takes its
 *   subscriptions with it. This is the `WeakMap` v3's scoped-groups registry
 *   used, for the same reason.
 * - `subscriptionIndex` is the iterable half, and it holds `WeakRef`s so it
 *   pins nothing either. Dead entries are pruned on the sweep that finds them.
 *
 * A strong `Set` of subscriptions would have been simpler and wrong: the
 * callback closes over the consumer instance, which holds its element, so the
 * registry would keep every consumer that ever resolved alive for the life of
 * the page.
 */

function runTeardown(subscription: ContextSubscription): void {
  const { teardown } = subscription;
  subscription.teardown = undefined;
  if (!teardown) {
    return;
  }
  try {
    teardown();
  } catch (error) {
    console.error('[context] Re-answer teardown failed:', error);
  }
}

/**
 * Hand an answer to a subscribed consumer, superseding the previous one.
 *
 * **The contract.** An answer is replaced, never accumulated: the teardown the
 * consumer returned for the previous value runs *before* the new value is
 * delivered, so whatever it had done with the old provider (joined a registry,
 * subscribed to a Signal, wrote to the DOM) is undone first. A consumer that
 * returns nothing is saying its own re-answer handling is idempotent.
 *
 * An identical value is not an answer: the consumer is already bound to it, so
 * only the bookkeeping moves. That matters because a nearer provider can hand
 * over the very same object — `provideRootContext` values do — and tearing a
 * working binding down to rebuild it identically is churn, not correctness.
 */
function deliver(subscription: ContextSubscription, value: unknown, providerNode: Node | null) {
  if (!subscription.isActive) {
    return;
  }
  if (subscription.hasValue && Object.is(value, subscription.value)) {
    subscription.providerNode = providerNode;
    return;
  }
  runTeardown(subscription);
  subscription.value = value;
  subscription.hasValue = true;
  subscription.providerNode = providerNode;
  const result = subscription.callback?.(value, subscription.unsubscribe);
  if (typeof result === 'function') {
    subscription.teardown = result;
  }
}

/**
 * Re-ask on behalf of every subscribed consumer the newly mounted element can
 * have changed the answer for.
 *
 * **One listener, at the document, for the whole page** — not one per
 * consumer, and no provider-side broadcast. Every mount already announces
 * itself with a bubbling `component:mounted`, so the trigger exists; what was
 * missing was permission to re-answer.
 *
 * Two `contains()` calls bound the work, and together they are exactly the set
 * of consumers whose answer *can* have changed:
 *
 * 1. `mountedEl.contains(el)` — a provider that is not an ancestor of the
 *    consumer can never answer it.
 * 2. `providerNode.contains(mountedEl)` — a provider outside the one already
 *    answering is farther away, and the nearest still wins.
 *
 * (2) is the generalisation of "only consumers answered by the root provider
 * can be wrong": the root provider sits on `document.documentElement`, which
 * contains everything, so those consumers always pass — and a consumer already
 * held by a nearer provider is dropped before anything is dispatched.
 */
function onComponentMounted(event: Event): void {
  const mountedEl = event.target;
  if (!(mountedEl instanceof Element) || subscriptionIndex.size === 0) {
    return;
  }
  // Snapshot: a delivery can unsubscribe, and pruning mutates the index.
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
    requestContext(subscription.request);
  }
}

function subscribeRequest(subscription: ContextSubscription): void {
  let owned = subscriptionsByElement.get(subscription.el);
  if (!owned) {
    owned = new Set();
    subscriptionsByElement.set(subscription.el, owned);
  }
  owned.add(subscription);
  subscriptionIndex.add(subscription.ref);

  if (!contextState.isMountListenerAttached) {
    contextState.isMountListenerAttached = true;
    // Nothing at import time: a page with no subscribed consumer never gets
    // this listener, exactly as it never gets a root provider.
    document.addEventListener(MOUNTED_EVENT, onComponentMounted);
  }
}

function unsubscribeRequest(subscription: ContextSubscription): void {
  if (!subscription.isActive) {
    return;
  }
  subscription.isActive = false;
  pendingRequests.delete(subscription.request);
  subscriptionsByElement.get(subscription.el)?.delete(subscription);
  subscriptionIndex.delete(subscription.ref);
  runTeardown(subscription);
}

/**
 * Provide a value for the subtree rooted at `el`.
 * The nearest provider wins, because the consumer's request event stops at
 * the first ancestor that answers.
 *
 * **The value is provided verbatim** — nothing is wrapped. What the owner
 * hands over is exactly what a consumer resolves, so the key's type decides
 * the shape:
 *
 * - reactive state → provide a `Signal`;
 * - a command surface → provide an object of methods (the `expose` pattern),
 *   which is what lets a control call its coordinator without reaching back
 *   through `$closest()`;
 * - both → provide an object holding Signals.
 */
export function provideContext<T>(
  el: Element,
  key: ContextKey<T>,
  value: T,
): { value: T; dispose: () => void } {
  const onRequest = (event: Event) => {
    const { detail } = event as CustomEvent<ContextRequestDetail>;
    if (detail?.key !== key) {
      return;
    }
    event.stopPropagation();
    detail.provide(value);
  };
  el.addEventListener(CONTEXT_REQUEST, onRequest);

  // Late provider: replay pending requests from inside this subtree.
  // Requests are re-dispatched from the consumer, so the nearest provider
  // still wins.
  //
  // This covers requests nobody has answered yet, and only those. A consumer
  // that was *already* answered — by a page-wide root provider, typically —
  // is taken back by the mount announcement instead, and only if it asked to
  // be (`subscribe: true`). Replaying here would re-answer from a provider
  // that is still constructing itself; the mount event fires after
  // `mounted()` has run.
  // Snapshot: answering a request removes it from `pendingRequests`.
  // oxlint-disable-next-line no-useless-spread
  for (const request of [...pendingRequests]) {
    if (request.key === key && el.contains(request.el)) {
      requestContext(request);
    }
  }

  return {
    value,
    dispose: () => el.removeEventListener(CONTEXT_REQUEST, onRequest),
  };
}

/** One root provider per key, created on demand and kept for the page. */
/**
 * Provide a value for the whole document, creating it on first use.
 *
 * This is the outermost scope, not a second mechanism: the value is provided on
 * `document.documentElement`, so a `context-request` from anywhere reaches it by
 * bubbling and **any nearer provider still wins**. A page-wide default and a
 * scoped override are the same primitive at different depths.
 *
 * It exists because provide/inject needs an ancestor to provide from, and some
 * things have no ancestor to name. A control that binds to its peers by a group
 * name is the case that forced it: give it a `DataScope`-shaped wrapper and the
 * wrapper provides, but a bare one on a page has nothing above it, and v3
 * answered that with a separate page-global registry keyed off `globalThis`.
 * Two registries meant two sets of semantics for one channel — this makes the
 * global case the outermost scope of the one that already exists.
 *
 *     // Scoped or page-wide, resolved the same way, nearest first.
 *     const channels =
 *       injectContextSync(el, DataChannels) ??
 *       provideRootContext(DataChannels, () => new Map());
 *
 * `create` runs at most once per key: later callers join the value the first one
 * made, which is what lets every peer ask without coordinating. Nothing is
 * created at import time — a page that never asks never gets a listener.
 *
 * A root provider is deliberately not disposable and outlives any instance that
 * happened to ask for it first: it is page state, and tying it to whichever
 * consumer mounted earliest is the ordering dependency this whole primitive
 * exists to remove. Tests stay isolated by making their own key with
 * `createContext()`, which is what a module does anyway.
 */
export function provideRootContext<T>(key: ContextKey<T>, create: () => T): T {
  if (rootProviders.has(key)) {
    return rootProviders.get(key) as T;
  }
  const value = create();
  rootProviders.set(key, value);
  provideContext(document.documentElement, key, value);
  return value;
}

/**
 * Resolve the nearest provided value for `key`, now or when a provider
 * appears. Order-independent.
 *
 * **The promise never settles while no provider exists.** That is the price
 * of order independence: a consumer mounting before its provider must not be
 * told "absent" by an ordering accident. A consumer that needs an answer now
 * — a click handler, a keyboard shortcut — asks with `injectContextSync()`
 * and falls back on `undefined`.
 *
 * **`subscribe: true` keeps the request live.** Without it the request is
 * deleted the moment anything answers, which means a nearer provider mounting
 * later can never take the consumer back — and because `provideRootContext`
 * answers from `document.documentElement`, "anything" includes a page-wide
 * default that reaches every unscoped consumer on the page. That is fine for a
 * control which found its coordinator and wrong for a channel resolved by
 * name, where falling back to the page silently trades values with the wrong
 * owner. Such a consumer subscribes:
 *
 *     const { cancel } = injectContext(el, RegistryKey, {
 *       subscribe: true,
 *       onProvide(registry) {
 *         const leave = registry.join(group, member);
 *         return leave; // undone before the next answer, and on cancel
 *       },
 *     });
 *
 * `cancel()` is the unsubscribe: it drops the request, whether answered or
 * not, and runs the teardown of the answer in force.
 */
export function injectContext<T>(
  el: Element,
  key: ContextKey<T>,
  { subscribe = false, onProvide }: InjectContextOptions<T> = {},
): { promise: Promise<T>; cancel: () => void } {
  if (!subscribe) {
    let request!: PendingRequest;
    const promise = new Promise<T>((resolve) => {
      request = {
        el,
        key,
        subscribe: false,
        resolve: (value) => {
          onProvide?.(value as T, () => pendingRequests.delete(request));
          resolve(value as T);
        },
      };
      if (!requestContext(request)) {
        pendingRequests.add(request);
      }
    });
    return { promise, cancel: () => pendingRequests.delete(request) };
  }

  const subscription = {
    el,
    callback: onProvide as ContextCallback<unknown> | undefined,
    providerNode: null,
    value: undefined,
    hasValue: false,
    isActive: true,
  } as ContextSubscription;
  subscription.ref = new WeakRef(subscription);
  subscription.unsubscribe = () => unsubscribeRequest(subscription);

  const promise = new Promise<T>((resolve) => {
    subscription.request = {
      el,
      key,
      subscribe: true,
      resolve: (value, providerNode) => {
        deliver(subscription, value, providerNode);
        resolve(value as T);
      },
    };
    subscribeRequest(subscription);
    if (!requestContext(subscription.request)) {
      // Not answered yet: the request waits in the pending set for a late
      // provider exactly as an unsubscribed one does. Being subscribed
      // changes what happens *after* the first answer, not before it.
      pendingRequests.add(subscription.request);
    }
  });

  return { promise, cancel: subscription.unsubscribe };
}

/**
 * Resolve the nearest provided value for `key` — now, or not at all.
 *
 * The context request is answered synchronously when a provider is already
 * listening, so this is the same round trip as `injectContext()` without the
 * promise: nothing is queued, nothing is replayed later. `undefined` means
 * "no provider above this element right now", which a control can act on
 * (fall back, do nothing) instead of waiting forever.
 *
 * There is no subscribed form of this one: a subscription needs a handle to
 * end it, and this returns a bare value on purpose. A consumer that wants both
 * — an answer in this tick *and* the right to be re-answered — uses
 * `injectContext(el, key, { subscribe: true, onProvide })`, whose `onProvide`
 * runs synchronously on the first answer too.
 */
export function injectContextSync<T>(el: Element, key: ContextKey<T>): T | undefined {
  let resolved: T | undefined;
  requestContext({
    el,
    key,
    subscribe: false,
    resolve: (value) => {
      resolved = value as T;
    },
  });
  return resolved;
}
