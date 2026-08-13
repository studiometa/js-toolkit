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
 *   `add`/`remove`/`has`. It is spelled `subscribe` rather than v3's `add`
 *   because the arity changed: v3's `add('id', callback)` would otherwise
 *   have compiled here and subscribed the string.
 */
export type Unsubscribe = () => void;

/**
 * What a subscriber may hand back is the service's own business, so it is a
 * parameter: `void` for a source that expects nothing, `void | RafRender` for
 * the frame service, which collects render functions. Typing it `unknown`
 * accepted anything — `useRaf().subscribe(() => 42)` compiled, and a stray
 * return from an assignment expression was then run as a DOM mutation on
 * every frame.
 */
export type ServiceCallback<T, R = void> = (props: T) => R;

/**
 * Options `subscribe()` takes, the same shape `Signal.subscribe()` uses.
 */
export interface SubscribeOptions {
  /**
   * Call this subscriber at once with the current props, instead of leaving it
   * to wait for the next update.
   *
   * **Only a source that has a current value delivers one.** The frame tick
   * has none between two frames, the pointer has none before it has been seen,
   * and a drag has none outside a gesture — so `immediate` is honoured by the
   * sampled sources (scroll, resize, breakpoint, a media query) and is a no-op
   * for the event-driven ones until they have something real to report. Each
   * service says which it is through `hasProps()`; the alternative was to
   * invent a value, which is what the neutral pointer position and the
   * pre-first-tick delta already are.
   *
   * This is opt-in rather than the default because the delivery is a layout
   * read in the subscriber's own turn, and because a source that emits on
   * subscribe and a source that does not cannot both be the default. The
   * asymmetry used to be per-service and invisible: a `ResizeObserver`
   * delivers the current box on `observe()` for free, so the resize service
   * spoke on subscribe and the other four did not.
   */
  immediate?: boolean;
}

export interface Service<T, R = void> {
  /**
   * Subscribe to the service, starting it if it was not running.
   *
   * @returns Unsubscribe. The service stops with its last subscriber.
   */
  subscribe(callback: ServiceCallback<T, R>, options?: SubscribeOptions): Unsubscribe;
  /**
   * The current props, without subscribing.
   *
   * **The props object belongs to the service, and is valid for the duration
   * of the call that received it.** A service may hand the same object to
   * every subscriber and overwrite it on the next update — which is what the
   * sampled sources do, rather than allocate per frame — so keep a copy of
   * anything needed later (`{ ...props }`). Every field is `readonly`: one
   * subscriber writing to the object would corrupt every other subscriber on
   * the page.
   *
   * Props are only kept up to date while the service runs. `useBreakpoint()`
   * is the exception it can afford to be: asking a `MediaQueryList` is cheap,
   * so its cold read is current.
   */
  props(): T;
}

/**
 * A service's own view of its props: the same shape, writable, because the
 * service is the one that fills it in.
 */
export type MutableProps<T> = { -readonly [K in keyof T]: T[K] };

export interface ServiceDefinition<T> {
  props(): T;
  /**
   * Whether `props()` describes something the service has observed, rather
   * than a resting value standing in for one. Defaults to `true`.
   *
   * It is what `{ immediate: true }` is gated on, and the only honest answer
   * for a source that is a stream of events rather than a sampled value: the
   * pointer's position before the first `pointermove` is the middle of the
   * viewport because something had to be there, and a drag outside a gesture
   * is `idle` for the same reason. Neither is worth delivering to a subscriber
   * as "where things stand".
   */
  hasProps?(): boolean;
  /**
   * Start observing, returning the teardown.
   *
   * `emit` fans the props out to every subscriber. What a subscriber returns
   * is between it and its service — `useRaf()` collects render functions
   * that way — so nothing comes back here.
   */
  start(emit: (props: T) => void): Unsubscribe;
}

/**
 * One holder of the service, not one callback: a `Set` keyed by the function
 * itself collapsed two holders of the same callback into one entry, so the
 * second subscription was never called and the first unsubscribe tore the
 * service down under it. Two components sharing a bound method, or one
 * module-level handler used twice, is enough.
 */
interface Subscription<T, R> {
  callback: ServiceCallback<T, R>;
  /**
   * Cleared by the unsubscribe, checked by the fan-out.
   *
   * The fan-out iterates a snapshot, so deleting an entry from the set is no
   * longer enough to keep it out of an update already in flight — this flag is
   * what a released subscription is skipped by.
   */
  isActive: boolean;
}

/**
 * Build a service from its definition.
 */
export function createService<T, R = void>({
  props,
  start,
  hasProps,
}: ServiceDefinition<T>): Service<T, R> {
  const subscriptions = new Set<Subscription<T, R>>();
  let stop: Unsubscribe | null = null;

  function emit(current: T): void {
    // A snapshot, not the live set. Iterating the set itself visits entries
    // *added* during the update, which is wrong twice over: the newcomer is
    // handed props measured before it existed, and a subscriber that
    // subscribes from inside its own callback never terminates — an unbounded
    // loop inside one emit, taking the frame and the tab with it.
    //
    // Removal was already correct, and correct *because* the set was live, so
    // the snapshot needs `isActive` beside it: a component destroyed inside
    // another's handler must still not be called in the update it left.
    const batch = [...subscriptions];
    for (const subscription of batch) {
      if (!subscription.isActive) {
        continue;
      }
      try {
        subscription.callback(current);
      } catch (error) {
        // One broken component must not deprive the others of the service,
        // which for a per-frame source would mean every frame from now on.
        //
        // `reportError()` rather than `console.error()`: it dispatches through
        // the platform's error channel, so `window.onerror` and everything
        // built on it — Sentry and friends — see the error with its own stack.
        // A logged string reaches nobody but whoever has the console open.
        reportError(error);
      }
    }
  }

  return {
    props,
    subscribe(callback, { immediate = false } = {}) {
      const subscription: Subscription<T, R> = { callback, isActive: true };
      subscriptions.add(subscription);
      stop ??= start(emit);
      // After `start()`, never before: starting is what makes `props()`
      // current — the scroll service measures its target there, the breakpoint
      // service asks its media queries — so delivering first would hand out
      // whatever the last run left behind.
      //
      // Only this subscriber is called. An emit would reach every other one
      // with props they have already been given, which is how "tell the
      // newcomer where things stand" turns into a duplicate update for the
      // whole page.
      if (immediate && (hasProps?.() ?? true)) {
        try {
          callback(props());
        } catch (error) {
          // The same channel the fan-out uses. Throwing out of `subscribe()`
          // instead would leave the caller holding no unsubscribe for a
          // subscription that is nonetheless registered.
          reportError(error);
        }
      }
      return () => {
        // Already gone: a repeated unsubscribe must not read as another holder
        // leaving.
        if (!subscription.isActive) {
          return;
        }
        // Cleared before the delete, so an update already iterating its
        // snapshot skips this callback rather than calling it after its own
        // unsubscribe returned.
        subscription.isActive = false;
        subscriptions.delete(subscription);
        // Others are still listening: nothing to release.
        if (subscriptions.size > 0) {
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
 * targets behind one observer is measurably indifferent (`service.bench.ts`),
 * so nothing here tries to.
 *
 * Extra arguments are the ones of the first call for a target — a second
 * caller joins the running service rather than reconfiguring it.
 */
export function perTarget<Target extends WeakKey, Args extends unknown[], T, R = void>(
  create: (target: Target, ...args: Args) => Service<T, R>,
): (target: Target, ...args: Args) => Service<T, R> {
  const services = new WeakMap<Target, Service<T, R>>();
  return (target, ...args) => {
    let service = services.get(target);
    if (!service) {
      service = create(target, ...args);
      services.set(target, service);
    }
    return service;
  };
}
