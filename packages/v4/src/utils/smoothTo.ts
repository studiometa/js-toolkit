import { useRaf } from '../services/raf.js';
import { toggle } from '../services/toggle.js';
import { damp, spring, type SpringOptions } from './maths.js';

/** The key a single value is held under, and the one its `damping` hook is asked about. */
const SCALAR_KEY = 'value';

export interface SmoothToOptions extends Omit<SpringOptions, 'damping'> {
  /**
   * Damping factor, or spring friction in spring mode. Defaults to `0.6`.
   *
   * A function is read on **every frame, for every channel**, which is what a
   * consumer whose factor is an option needs: `$options` is a live view over
   * attributes, so a value captured once would freeze an attribute the
   * framework keeps live. It is also how a factor that depends on the
   * direction of travel is expressed — read the current value and decide — and
   * how a record gives one channel a different rate from its neighbour. A
   * single value is asked about under the key `value`.
   */
  damping?: number | ((key: string) => number);
  /**
   * Spring physics instead of damping. Implied by `stiffness` or `mass`.
   *
   * The mode belongs to the instance, not to a channel: a record that wants a
   * spring for one value and damping for another is two instances, and pays
   * for two frame subscriptions to get it.
   */
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
  /** Set the value and its target at once, with no travel and no frame. */
  jump(value: number): number;
  /** Whether the value is still travelling. */
  readonly isMoving: boolean;
  /** Release the frame subscription and remove all subscribers. */
  destroy(): void;
}

/**
 * Several named values on one frame subscription.
 *
 * The record handed to a reader or a subscriber is the **same object every
 * frame**, as a service hands the same props: a 60 fps primitive should not
 * allocate per frame, and a consumer reads it synchronously. Treat it as
 * read-only.
 */
export interface SmoothToRecord<K extends string> {
  /** Read every smoothed value, or set some targets and read them back. */
  (values?: Partial<Record<K, number>>): Record<K, number>;
  /** Called on every frame any channel moves. @returns Unsubscribe. */
  subscribe(callback: (values: Record<K, number>) => unknown): () => void;
  /** The targets, unsmoothed. */
  raw(): Record<K, number>;
  /** Move some targets by a delta each. */
  add(deltas: Partial<Record<K, number>>): Record<K, number>;
  /** Set some values and their targets at once, with no travel and no frame. */
  jump(values: Partial<Record<K, number>>): Record<K, number>;
  /** Whether any channel is still travelling. */
  readonly isMoving: boolean;
  /** Release the frame subscription and remove all subscribers. */
  destroy(): void;
}

/** Smooth a value toward a target with one shared frame subscription. */
export function smoothTo(start?: number, options?: SmoothToOptions): SmoothTo;
/**
 * Smooth several named values toward their targets, on one frame subscription,
 * with one settled state and one subscriber call per frame. The keys are the
 * consumer's own — a scale, an opacity or a progress as readily as a coordinate.
 */
export function smoothTo<K extends string>(
  start: Record<K, number>,
  options?: SmoothToOptions,
): SmoothToRecord<K>;
export function smoothTo(
  start: number | Record<string, number> = 0,
  options: SmoothToOptions = {},
): SmoothTo | SmoothToRecord<string> {
  const { spring: useSpring, stiffness, mass, damping = 0.6 } = options;
  // A spring parameter enables spring mode.
  const isSpring = useSpring === true || stiffness !== undefined || mass !== undefined;
  // Each mode keeps the default of the function it wraps, so converting a raw
  // `damp()` or `spring()` call to this helper does not change where it snaps.
  const { precision = isSpring ? 1 / 1e4 : 0.01 } = options;
  const dampingNow = typeof damping === 'function' ? damping : () => damping;

  const isRecord = typeof start === 'object';
  const initial: Record<string, number> = isRecord ? start : { [SCALAR_KEY]: start };
  const keys = Object.keys(initial);

  const callbacks = new Set<(values: never) => unknown>();
  const targets = { ...initial };
  const values = { ...initial };
  const velocities: Record<string, number> = {};

  /** The reading a caller gets: the number itself, or the one shared record. */
  const read = () => (isRecord ? values : values[SCALAR_KEY]);

  const frame = toggle(() =>
    useRaf().subscribe(({ delta }) => {
      let isTravelling = false;

      for (const key of keys) {
        if (values[key] === targets[key]) {
          continue;
        }

        if (isSpring) {
          [values[key], velocities[key]] = spring(
            targets[key],
            values[key],
            velocities[key] ?? 0,
            delta,
            // Read per frame and per channel, so an option that changed since
            // the last frame counts, and one channel can travel at its own rate.
            { stiffness, mass, damping: dampingNow(key), precision },
          );
        } else {
          values[key] = damp(targets[key], values[key], dampingNow(key), delta, precision);
        }

        if (values[key] === targets[key]) {
          velocities[key] = 0;
        } else {
          isTravelling = true;
        }
      }

      // Release the shared frame subscription as soon as every channel arrives.
      if (!isTravelling) {
        frame.stop();
      }

      // Use a snapshot so subscription changes do not alter the current batch.
      const batch = [...callbacks];
      const reading = read() as never;
      for (const callback of batch) {
        callback(reading);
      }
    }),
  );

  /** Set the named targets, leaving every channel this call does not name alone. */
  function setTargets(next: Partial<Record<string, number>>) {
    let hasSomewhereToGo = false;

    for (const key of keys) {
      const value = next[key];
      if (value !== undefined) {
        targets[key] = value;
      }
      if (values[key] !== targets[key]) {
        hasSomewhereToGo = true;
      }
    }

    // `start()` is idempotent, so target updates share one subscription.
    if (hasSomewhereToGo) {
      frame.start();
    }
  }

  function update(next?: number | Partial<Record<string, number>>) {
    if (next !== undefined) {
      setTargets(typeof next === 'object' ? next : { [SCALAR_KEY]: next });
    }
    return read();
  }

  const api = Object.assign(update, {
    subscribe(callback: (values: never) => unknown) {
      callbacks.add(callback);
      return () => {
        callbacks.delete(callback);
      };
    },
    raw: () => (isRecord ? targets : targets[SCALAR_KEY]),
    add: (deltas: number | Partial<Record<string, number>>) => {
      const named = typeof deltas === 'object' ? deltas : { [SCALAR_KEY]: deltas };
      const moved: Record<string, number> = {};
      for (const [key, delta] of Object.entries(named)) {
        if (delta !== undefined) {
          moved[key] = targets[key] + delta;
        }
      }
      setTargets(moved);
      return read();
    },
    jump: (next: number | Partial<Record<string, number>>) => {
      const named = typeof next === 'object' ? next : { [SCALAR_KEY]: next };
      for (const [key, value] of Object.entries(named)) {
        if (value !== undefined) {
          targets[key] = value;
          values[key] = value;
          velocities[key] = 0;
        }
      }
      // A channel this call did not name may still be travelling.
      if (keys.every((key) => values[key] === targets[key])) {
        frame.stop();
      }
      return read();
    },
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

  // The implementation signature is wider than either overload — every method
  // takes and returns "a number or a record" — so the narrowing the overloads
  // promise cannot be checked from in here. The two forms are asserted at the
  // type level in the spec instead.
  return api as unknown as SmoothTo | SmoothToRecord<string>;
}
