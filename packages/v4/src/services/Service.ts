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
   * `emit` fans the props out to every subscriber and returns what they
   * returned, which is how `useRaf()` collects the render functions its
   * callbacks send back.
   */
  start(emit: (props: T) => unknown[]): () => void;
}

/**
 * Build a service from its definition.
 */
export function createService<T>({ props, start }: ServiceDefinition<T>): Service<T> {
  const callbacks = new Set<ServiceCallback<T>>();
  let stop: (() => void) | null = null;

  function emit(current: T): unknown[] {
    const results: unknown[] = [];
    for (const callback of callbacks) {
      try {
        results.push(callback(current));
      } catch (error) {
        // One broken component must not deprive the others of the service,
        // which for a per-frame source would mean every frame from now on.
        console.error('[service] Subscriber failed:', error);
      }
    }
    return results;
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
