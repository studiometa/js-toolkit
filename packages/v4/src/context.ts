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
  provide(value: unknown): void;
}

interface PendingRequest {
  el: Element;
  key: symbol;
  resolve(value: unknown): void;
}

const pendingRequests = new Set<PendingRequest>();

function requestContext(request: PendingRequest): boolean {
  let isAnswered = false;
  const detail: ContextRequestDetail = {
    key: request.key,
    provide(value) {
      isAnswered = true;
      pendingRequests.delete(request);
      request.resolve(value);
    },
  };
  request.el.dispatchEvent(new CustomEvent(CONTEXT_REQUEST, { bubbles: true, detail }));
  return isAnswered;
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
const rootProviders = new Map<symbol, unknown>();

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
 */
export function injectContext<T>(
  el: Element,
  key: ContextKey<T>,
): { promise: Promise<T>; cancel: () => void } {
  let request!: PendingRequest;
  const promise = new Promise<T>((resolve) => {
    request = { el, key, resolve: resolve as (value: unknown) => void };
    if (!requestContext(request)) {
      pendingRequests.add(request);
    }
  });
  return { promise, cancel: () => pendingRequests.delete(request) };
}

/**
 * Resolve the nearest provided value for `key` — now, or not at all.
 *
 * The context request is answered synchronously when a provider is already
 * listening, so this is the same round trip as `injectContext()` without the
 * promise: nothing is queued, nothing is replayed later. `undefined` means
 * "no provider above this element right now", which a control can act on
 * (fall back, do nothing) instead of waiting forever.
 */
export function injectContextSync<T>(el: Element, key: ContextKey<T>): T | undefined {
  let resolved: T | undefined;
  requestContext({
    el,
    key,
    resolve: (value) => {
      resolved = value as T;
    },
  });
  return resolved;
}
