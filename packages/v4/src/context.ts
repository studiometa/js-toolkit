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
export class Signal<T = unknown> {
  #value: T;

  #subscribers = new Set<(value: T) => void>();

  constructor(value: T) {
    this.#value = value;
  }

  get value(): T {
    return this.#value;
  }

  set value(next: T) {
    if (next === this.#value) {
      return;
    }
    this.#value = next;
    for (const callback of this.#subscribers) {
      callback(next);
    }
  }

  /**
   * @returns Unsubscribe.
   */
  subscribe(callback: (value: T) => void, { immediate = false } = {}): () => void {
    this.#subscribers.add(callback);
    if (immediate) {
      callback(this.#value);
    }
    return () => this.#subscribers.delete(callback);
  }
}

interface ContextRequestDetail {
  key: symbol;
  provide(signal: Signal<unknown>): void;
}

interface PendingRequest {
  el: Element;
  key: symbol;
  resolve(signal: Signal<unknown>): void;
}

const pendingRequests = new Set<PendingRequest>();

function requestContext(request: PendingRequest): boolean {
  let isAnswered = false;
  const detail: ContextRequestDetail = {
    key: request.key,
    provide(signal) {
      isAnswered = true;
      pendingRequests.delete(request);
      request.resolve(signal);
    },
  };
  request.el.dispatchEvent(new CustomEvent(CONTEXT_REQUEST, { bubbles: true, detail }));
  return isAnswered;
}

/**
 * Provide a reactive value for the subtree rooted at `el`.
 * The nearest provider wins, because the consumer's request event stops at
 * the first ancestor that answers.
 */
export function provideContext<T>(
  el: Element,
  key: ContextKey<T>,
  value: T | Signal<T>,
): { signal: Signal<T>; dispose: () => void } {
  const signal = value instanceof Signal ? value : new Signal(value);
  const onRequest = (event: Event) => {
    const { detail } = event as CustomEvent<ContextRequestDetail>;
    if (detail?.key !== key) {
      return;
    }
    event.stopPropagation();
    detail.provide(signal as unknown as Signal<unknown>);
  };
  el.addEventListener(CONTEXT_REQUEST, onRequest);

  // Late provider: replay pending requests from inside this subtree.
  // Requests are re-dispatched from the consumer, so the nearest provider
  // still wins.
  // Snapshot: answering a request removes it from `pendingRequests`.
  // oxlint-disable-next-line no-useless-spread
  for (const request of [...pendingRequests]) {
    if (request.key === key && el.contains(request.el)) {
      requestContext(request);
    }
  }

  return {
    signal,
    dispose: () => el.removeEventListener(CONTEXT_REQUEST, onRequest),
  };
}

/**
 * Resolve the nearest provided signal for `key`, now or when a provider
 * appears. Order-independent.
 */
export function injectContext<T>(
  el: Element,
  key: ContextKey<T>,
): { promise: Promise<Signal<T>>; cancel: () => void } {
  let request!: PendingRequest;
  const promise = new Promise<Signal<T>>((resolve) => {
    request = { el, key, resolve: resolve as unknown as (signal: Signal<unknown>) => void };
    if (!requestContext(request)) {
      pendingRequests.add(request);
    }
  });
  return { promise, cancel: () => pendingRequests.delete(request) };
}
