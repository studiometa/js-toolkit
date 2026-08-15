import type { Unsubscribe } from './service.js';

/**
 * A subscription the caller starts and stops, handed back by `toggle()`.
 *
 * `start` and `stop` are bound, so either can be passed around on its own —
 * `stop` is a cleanup, and `mounted()` can return it as it stands.
 */
export interface Toggle {
  /** Whether the subscription is running. */
  readonly isActive: boolean;
  /** Subscribe now, unless it is subscribed already. */
  start(): void;
  /** Release the subscription, if it has one. */
  stop(): void;
}

/**
 * Turn anything that returns its own unsubscribe into a subscription that can
 * be suspended and resumed.
 *
 * A mount cycle is the right span for most subscriptions and the wrong one for
 * a component that needs the frame loop only while a value settles:
 *
 *     class SliderItem extends Base {
 *       #frame = toggle(() => useRaf().subscribe(({ delta }) => this.follow(delta)));
 *
 *       mounted() {
 *         return this.#frame.stop;   // bound, so it is a cleanup as it is
 *       }
 *
 *       onIndexChange() { this.#frame.start(); }
 *       onSettled() { this.#frame.stop(); }
 *     }
 *
 * This is what `{ manual: true }` plus `$enable(hook)` / `$disable(hook)` used
 * to do, without the string keys, the per-instance map or the typo a runtime
 * warning had to catch. It is also source-agnostic — `Signal.subscribe()`,
 * `provideContext()` and the mount strategies hand back the same shape — and
 * it works outside a component, which a pair of instance methods could not.
 *
 * `start()` is idempotent, so a subscription cannot end up running twice, and
 * `stop()` is safe whether or not it is running. Reference counting does the
 * rest: a stopped service with no other subscriber genuinely stops — no
 * listener, no observer, no frame.
 */
export function toggle(subscribe: () => Unsubscribe): Toggle {
  let unsubscribe: Unsubscribe | null = null;
  let isStarting = false;
  let stopPending = false;

  return {
    get isActive() {
      return unsubscribe !== null || (isStarting && !stopPending);
    },
    start: () => {
      if (unsubscribe !== null || isStarting) {
        return;
      }

      isStarting = true;
      try {
        const cleanup = subscribe();
        if (stopPending) {
          cleanup();
        } else {
          unsubscribe = cleanup;
        }
      } finally {
        isStarting = false;
        stopPending = false;
      }
    },
    stop: () => {
      if (isStarting) {
        stopPending = true;
        return;
      }

      const cleanup = unsubscribe;
      unsubscribe = null;
      cleanup?.();
    },
  };
}
