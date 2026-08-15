import { getSharedRuntimeSlot } from './shared-runtime.js';

const CONTEXT_REQUEST = 'js-toolkit:context:request';

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

interface ContextRequestDetail {
  key: symbol;
  /** Required by the WICG protocol for subscribed third-party requests. */
  subscribe: boolean;
  provide(value: unknown): void;
}

/**
 * One context request on the private event transport.
 *
 * @internal
 */
export interface ContextRequest {
  el: Element;
  key: symbol;
  subscribe: boolean;
  resolve(value: unknown, providerNode: Node | null): void;
}

interface ContextRuntimeState {
  pendingRequests: Set<ContextRequest>;
  rootProviders: Map<symbol, unknown>;
}

const contextState = /* @__PURE__ */ getSharedRuntimeSlot<ContextRuntimeState>(
  'context',
  2,
  () => ({
    pendingRequests: new Set(),
    rootProviders: new Map(),
  }),
);
const { pendingRequests, rootProviders } = contextState;

/**
 * Dispatch one request and report whether a provider answered synchronously.
 *
 * @internal
 */
export function dispatchContextRequest(request: ContextRequest): boolean {
  let isAnswered = false;
  let event!: CustomEvent<ContextRequestDetail>;
  const detail: ContextRequestDetail = {
    key: request.key,
    subscribe: request.subscribe,
    provide(value) {
      isAnswered = true;
      pendingRequests.delete(request);
      const provider = event.currentTarget;
      request.resolve(
        value,
        provider !== null && 'contains' in provider ? (provider as Node) : null,
      );
    },
  };
  event = new CustomEvent(CONTEXT_REQUEST, { bubbles: true, detail });
  request.el.dispatchEvent(event);
  return isAnswered;
}

/** Keep an unanswered request available for a provider that appears later. @internal */
export function retainContextRequest(request: ContextRequest): void {
  pendingRequests.add(request);
}

/** Stop replaying an unanswered request. @internal */
export function cancelContextRequest(request: ContextRequest): void {
  pendingRequests.delete(request);
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
  // This covers requests nobody has answered yet, and only those. Optional
  // subscriptions re-ask after the provider has completed its mount instead
  // of accepting an answer from a provider that is still constructing itself.
  // Snapshot: answering a request removes it from `pendingRequests`.
  // oxlint-disable-next-line no-useless-spread
  for (const request of [...pendingRequests]) {
    if (request.key === key && el.contains(request.el)) {
      dispatchContextRequest(request);
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
 * `document.documentElement`, so a context request from anywhere reaches it by
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
 * appears. This request is one-shot: the first answer settles the promise and
 * removes the request.
 *
 * The promise stays pending while no provider exists. `cancel()` removes that
 * pending request and does nothing after an answer.
 */
export function injectContext<T>(
  el: Element,
  key: ContextKey<T>,
): { promise: Promise<T>; cancel: () => void } {
  let request!: ContextRequest;
  const promise = new Promise<T>((resolve) => {
    request = {
      el,
      key,
      subscribe: false,
      resolve: (value) => resolve(value as T),
    };
    if (!dispatchContextRequest(request)) {
      retainContextRequest(request);
    }
  });
  return { promise, cancel: () => cancelContextRequest(request) };
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
 */
export function injectContextSync<T>(el: Element, key: ContextKey<T>): T | undefined {
  let resolved: T | undefined;
  dispatchContextRequest({
    el,
    key,
    subscribe: false,
    resolve: (value) => {
      resolved = value as T;
    },
  });
  return resolved;
}
