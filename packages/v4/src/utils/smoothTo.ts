import { useRaf } from '../services/raf.js';
import { toggle } from '../services/toggle.js';
import { damp, spring, type SpringOptions } from './maths.js';

export interface SmoothToOptions extends SpringOptions {
  /**
   * Fraction of the remaining distance closed per frame when not springing,
   * from `0` (never arrives) to `1` (arrives at once). Defaults to `0.6`.
   *
   * Also the spring's friction when `spring` is on, which is v3's overloading
   * of the name and is kept: the two modes never run at once, so the value
   * only ever means one thing at a time.
   */
  damping?: number;
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
  /**
   * Release the frame subscription and drop the subscribers.
   *
   * v3 had no way to do this, which is the other half of why it leaked: a
   * `smoothTo` whose component was destroyed kept whatever loops it had going.
   */
  destroy(): void;
}

/**
 * Smooth a value towards a target, on the frame service.
 *
 * ```js
 * const x = smoothTo(0);
 * x.subscribe((value) => el.style.setProperty('--x', `${value}px`));
 * x(100);      // starts moving
 * x.destroy(); // releases the frame
 * ```
 *
 * **This is not v3's `smoothTo`, and the difference is a bug rather than a
 * preference.** There, `update()` called `tick()` synchronously and `tick()`
 * re-scheduled itself through `requestAnimationFrame` with nothing cancelling
 * or de-duplicating. So *every* call while the value was still settling started
 * another self-perpetuating chain: five updates in one frame measured five
 * chains, five subscriber notifications per frame, and five more frames queued.
 * The value then converged N times faster than asked, where N was however many
 * times the caller happened to set it — so a `smoothTo` driven from a scroll
 * handler, which is what it is for, sped up with the scrolling.
 *
 * Here the frame subscription is a {@link toggle} over {@link useRaf}: one
 * subscription however many times the target is set, started when the value has
 * somewhere to go and released the moment it arrives. Reference counting does
 * the rest — the last `smoothTo` to stop stops the frame loop with it.
 *
 * It also owns no `requestAnimationFrame` of its own, which the design forbids
 * for a reason this is a good illustration of.
 */
export function smoothTo(start = 0, options: SmoothToOptions = {}): SmoothTo {
  const { spring: useSpring, stiffness, mass, damping = 0.6, precision = 1 / 1e4 } = options;
  // v3 inferred the mode from whether a spring parameter was given, which is
  // the useful default: naming `stiffness` means wanting a spring.
  const isSpring = useSpring === true || stiffness !== undefined || mass !== undefined;

  const callbacks = new Set<(value: number) => unknown>();
  let target = start;
  let value = start;
  let velocity = 0;

  const frame = toggle(() =>
    useRaf().subscribe(({ delta }) => {
      if (isSpring) {
        [value, velocity] = spring(target, value, velocity, delta, {
          stiffness,
          mass,
          damping,
          precision,
        });
      } else {
        value = damp(target, value, damping, delta, precision);
      }

      // Released here rather than by the caller: the value has arrived, and a
      // frame subscription nobody needs is the thing this exists to avoid.
      if (value === target) {
        velocity = 0;
        frame.stop();
      }

      // Written from the frame's own callback, so a subscriber that measures
      // gets the read phase and can return its own write.
      //
      // A snapshot, because a subscriber may leave — or arrive — while being
      // notified, and the live set would visit an arrival with a value it was
      // not there for.
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
    // Idempotent, so setting the target a hundred times in one frame is one
    // subscription — the whole of the bug this replaces.
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

  // Defined rather than assigned: `Object.assign` reads a getter and copies the
  // value it happened to return, so declaring this in the object above froze it
  // at `false` for the object's whole life.
  Object.defineProperty(api, 'isMoving', {
    get: () => frame.isActive,
    enumerable: true,
  });

  return api as SmoothTo;
}
