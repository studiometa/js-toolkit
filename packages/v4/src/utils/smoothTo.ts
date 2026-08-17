import { useRaf } from '../services/raf.js';
import { toggle } from '../services/toggle.js';
import { damp, spring, type SpringOptions } from './maths.js';

export interface SmoothToOptions extends Omit<SpringOptions, 'damping'> {
  /**
   * Damping factor, or spring friction in spring mode. Defaults to `0.6`.
   *
   * A function is read on **every frame**, which is what a consumer whose
   * factor is an option needs: `$options` is a live view over attributes, so a
   * value captured once would freeze an attribute the framework keeps live.
   * It is also how a factor that depends on the direction of travel is
   * expressed — read the current value and decide.
   */
  damping?: number | (() => number);
  /** Spring physics instead of damping. Implied by `stiffness` or `mass`. */
  spring?: boolean;
}

export interface SmoothTo {
  /** Read the smoothed value, or set a new target and get the smoothed value. */
  (value?: number): number;
  /** Called with the smoothed value on every frame it moves. @returns Unsubscribe. */
  subscribe(callback: (value: number) => unknown): () => void;
  /** The target, unsmoothed. */
  raw(): number;
  /** Move the target by `delta`. */
  add(delta: number): number;
  /** Whether the value is still travelling. */
  readonly isMoving: boolean;
  /** Release the frame subscription and remove all subscribers. */
  destroy(): void;
}

/** Smooth a value toward a target with one shared frame subscription. */
export function smoothTo(start = 0, options: SmoothToOptions = {}): SmoothTo {
  const { spring: useSpring, stiffness, mass, damping = 0.6, precision = 1 / 1e4 } = options;
  // A spring parameter enables spring mode.
  const isSpring = useSpring === true || stiffness !== undefined || mass !== undefined;
  const dampingNow = typeof damping === 'function' ? damping : () => damping;

  const callbacks = new Set<(value: number) => unknown>();
  let target = start;
  let value = start;
  let velocity = 0;

  const frame = toggle(() =>
    useRaf().subscribe(({ delta }) => {
      // Read per frame, so an option that changed since the last one counts.
      const factor = dampingNow();

      if (isSpring) {
        [value, velocity] = spring(target, value, velocity, delta, {
          stiffness,
          mass,
          damping: factor,
          precision,
        });
      } else {
        value = damp(target, value, factor, delta, precision);
      }

      // Release the shared frame subscription as soon as the value arrives.
      if (value === target) {
        velocity = 0;
        frame.stop();
      }

      // Use a snapshot so subscription changes do not alter the current batch.
      const batch = [...callbacks];
      for (const callback of batch) {
        callback(value);
      }
    }),
  );

  function update(next?: number): number {
    if (next === undefined) {
      return value;
    }
    target = next;
    // `start()` is idempotent, so target updates share one subscription.
    if (value !== target) {
      frame.start();
    }
    return value;
  }

  const api = Object.assign(update, {
    subscribe(callback: (value: number) => unknown) {
      callbacks.add(callback);
      return () => {
        callbacks.delete(callback);
      };
    },
    raw: () => target,
    add: (delta: number) => update(target + delta),
    destroy() {
      frame.stop();
      callbacks.clear();
    },
  });

  // `Object.assign` would evaluate and copy a getter value.
  Object.defineProperty(api, 'isMoving', {
    get: () => frame.isActive,
    enumerable: true,
  });

  return api as SmoothTo;
}
