/**
 * A service is a shared source of props — the frame tick, the scroll
 * position, the pointer — that components subscribe to.
 *
 * Two properties define one, and both are enforced here rather than in each
 * service:
 *
 * - **Lazy and reference-counted.** Nothing is observed until the first
 *   subscriber arrives, and everything is released when the last one leaves.
 *   A service with no subscriber does no work at all: no listener, no
 *   observer, no frame.
 * - **Symmetric.** Subscribing hands back the only thing needed to undo it,
 *   the same shape `Signal.subscribe()`, `provideContext()` and the mount
 *   strategies use. v3 keyed callbacks by an instance id and exposed
 *   `add`/`remove`/`has`; a closure is both smaller and impossible to
 *   desynchronize.
 */
export type ServiceCallback<T> = (props: T) => unknown;

export interface Service<T> {
  /**
   * Subscribe to the service, starting it if it was not running.
   *
   * @returns Unsubscribe. The service stops with its last subscriber.
   */
  add(callback: ServiceCallback<T>): () => void;
  /**
   * The current props, without subscribing. They are only kept up to date
   * while the service runs.
   */
  props(): T;
}

export interface ServiceDefinition<T> {
  props(): T;
  /**
   * Start observing, returning the teardown.
   *
   * `emit` fans the props out to every subscriber. What a subscriber returns
   * is between it and its service — `useRaf()` collects render functions
   * that way — so nothing comes back here.
   */
  start(emit: (props: T) => void): () => void;
}

/**
 * Build a service from its definition.
 */
export function createService<T>({ props, start }: ServiceDefinition<T>): Service<T> {
  const callbacks = new Set<ServiceCallback<T>>();
  let stop: (() => void) | null = null;

  function emit(current: T): void {
    for (const callback of callbacks) {
      try {
        callback(current);
      } catch (error) {
        // One broken component must not deprive the others of the service,
        // which for a per-frame source would mean every frame from now on.
        console.error('[service] Subscriber failed:', error);
      }
    }
  }

  return {
    props,
    add(callback) {
      callbacks.add(callback);
      stop ??= start(emit);
      return () => {
        // Already gone, or others are still listening: nothing to release.
        if (!callbacks.delete(callback) || callbacks.size > 0) {
          return;
        }
        stop?.();
        stop = null;
      };
    },
  };
}

/**
 * Key a service by what it observes: one instance per target, held in a
 * `WeakMap` so a target and its service are collected together.
 *
 * The reason is lifecycle bookkeeping, not throughput. Reference counting
 * only means something against a target: `useResize(a)` losing its last
 * subscriber must disconnect the observer watching `a` and leave the one
 * watching `b` alone, which a single shared observer could not do. Grouping
 * targets behind one observer is measurably indifferent (`Service.bench.ts`),
 * so nothing here tries to.
 *
 * Extra arguments are the ones of the first call for a target — a second
 * caller joins the running service rather than reconfiguring it.
 */
export function perTarget<Target extends WeakKey, Args extends unknown[], T>(
  create: (target: Target, ...args: Args) => Service<T>,
): (target: Target, ...args: Args) => Service<T> {
  const services = new WeakMap<Target, Service<T>>();
  return (target, ...args) => {
    let service = services.get(target);
    if (!service) {
      service = create(target, ...args);
      services.set(target, service);
    }
    return service;
  };
}
