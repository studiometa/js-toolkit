import type { Unsubscribe } from './service.js';

/** A subscription that the caller can start and stop. Methods are bound. */
export interface Toggle {
  /** Whether the subscription is running. */
  readonly isActive: boolean;
  /** Subscribe now, unless it is subscribed already. */
  start: () => void;
  /** Release the subscription, if it has one. */
  stop: () => void;
}

/**
 * Make an unsubscribe-producing operation suspendable and resumable.
 *
 * `start()` and `stop()` are idempotent.
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
