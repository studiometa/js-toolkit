import { reportDiagnostic } from '../diagnostics.js';

/** Release one subscription. Services start with their first subscriber and stop with their last. */
export type Unsubscribe = () => void;

/** A service callback with a service-specific return type. */
export type ServiceCallback<T, R = void> = (props: T) => R;

/** Subscription options. */
export interface SubscribeOptions {
  /** Deliver current props immediately when the source has an observed value. */
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
   * Return current props without subscribing. The shared object can be overwritten on the next update; copy values that must persist.
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
  /** Whether `props()` contains an observed value. Defaults to `true`. */
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

/** One independently owned subscription. */
interface Subscription<T, R> {
  callback: ServiceCallback<T, R>;
  /** Prevent delivery after unsubscribe during a snapshot iteration. */
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
  let state: 'idle' | 'starting' | 'running' = 'idle';
  let stop: Unsubscribe | null = null;

  function emit(current: T): void {
    // Snapshot delivery excludes later additions; `isActive` handles removals.
    const batch = [...subscriptions];
    for (const subscription of batch) {
      if (!subscription.isActive) {
        continue;
      }
      try {
        subscription.callback(current);
      } catch (error) {
        // Isolate subscriber failures.
        reportDiagnostic('callback.service-failed', 'A service subscriber failed.', error);
      }
    }
  }

  return {
    props,
    subscribe(callback, { immediate = false } = {}) {
      const subscription: Subscription<T, R> = { callback, isActive: true };
      subscriptions.add(subscription);
      if (state === 'idle') {
        // Mark startup first so reentrant subscriptions join this run.
        state = 'starting';
        try {
          stop = start(emit);
          state = 'running';
        } catch (error) {
          // Roll back every subscription that joined the failed startup.
          for (const joined of subscriptions) {
            joined.isActive = false;
          }
          subscriptions.clear();
          stop = null;
          state = 'idle';
          throw error;
        }
      }
      // Deliver after startup, when props are current, and only to the new subscriber.
      if (immediate && (hasProps?.() ?? true)) {
        try {
          callback(props());
        } catch (error) {
          // Keep `subscribe()` successful so the caller receives its unsubscribe.
          reportDiagnostic(
            'callback.service-failed',
            'An immediate service subscriber failed.',
            error,
          );
        }
      }
      return () => {
        // Unsubscribe is idempotent.
        if (!subscription.isActive) {
          return;
        }
        // Clear activity before removal so an active snapshot skips it.
        subscription.isActive = false;
        subscriptions.delete(subscription);
        if (subscriptions.size > 0) {
          return;
        }
        if (state !== 'running') {
          return;
        }
        const release = stop;
        stop = null;
        state = 'idle';
        release?.();
      };
    },
  };
}

/** Serialize plain-data arguments for service identity. Property order is significant. */
function serializeArgs(...args: unknown[]): string {
  return JSON.stringify(args);
}

/**
 * Create one weakly held service per target and argument key.
 *
 * @param create Called once per target and argument pair.
 * @param keyOf Serializes arguments. Defaults to `JSON.stringify()`.
 */
export function perTarget<Target extends WeakKey, Args extends unknown[], T, R = void>(
  create: (target: Target, ...args: Args) => Service<T, R>,
  keyOf: (...args: Args) => string = serializeArgs,
): (target: Target, ...args: Args) => Service<T, R> {
  const services = new WeakMap<Target, Map<string, Service<T, R>>>();
  return (target, ...args) => {
    let byArgs = services.get(target);
    if (!byArgs) {
      byArgs = new Map();
      services.set(target, byArgs);
    }
    const key = keyOf(...args);
    let service = byArgs.get(key);
    if (!service) {
      service = create(target, ...args);
      byArgs.set(key, service);
    }
    return service;
  };
}
