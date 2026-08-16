import { isolateCallbackFailure } from './diagnostics.js';
import { getSharedRuntimeSlot } from './shared-runtime.js';

const CONTEXT_REQUEST = 'js-toolkit:context:request';

/** A typed context key. `__context` is type-only. */
export type ContextKey<T = unknown> = symbol & { readonly __context?: T };

/** Create a typed context key. */
export function createContext<T = unknown>(description = 'context'): ContextKey<T> {
  return Symbol(description);
}

/** A reactive value with synchronous subscriptions. */
export interface Signal<T = unknown> {
  /** The latest value, including during delivery. */
  value: T;
  /** @returns Unsubscribe. */
  subscribe(callback: (value: T) => void, options?: { immediate?: boolean }): () => void;
}

/** Each subscription has independent ownership and active state. */
interface Subscriber<T> {
  callback: (value: T) => void;
  isActive: boolean;
}

/**
 * Create a reactive value.
 *
 * Writes settle synchronously. A reentrant write supersedes the current delivery, so no subscriber observes an older value after a newer one.
 */
export function signal<T>(initialValue: T): Signal<T> {
  let current = initialValue;
  let delivered = initialValue;
  let isSettling = false;
  const subscribers = new Set<Subscriber<T>>();

  function settle() {
    // The active loop drains reentrant writes without nesting delivery.
    if (isSettling) {
      return;
    }
    isSettling = true;
    try {
      while (delivered !== current) {
        delivered = current;
        // Snapshot delivery excludes later additions; `isActive` handles removals.
        for (const subscriber of [...subscribers]) {
          if (!subscriber.isActive) {
            continue;
          }
          isolateCallbackFailure('callback.signal-failed', 'A signal subscriber failed.', () =>
            subscriber.callback(delivered),
          );
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
        isolateCallbackFailure(
          'callback.signal-failed',
          'An immediate signal subscriber failed.',
          () => callback(current),
        );
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

/** Provide a value verbatim for a subtree. The nearest provider wins. */
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

  // Re-dispatch pending subtree requests so the nearest provider still wins.
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

/**
 * Provide a document-wide value created once per key. Nearer providers override it.
 *
 * Root providers are page-lifetime and cannot be disposed.
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

/** Resolve the nearest provided value synchronously, or return `undefined`. */
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
