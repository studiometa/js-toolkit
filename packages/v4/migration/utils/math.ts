/**
 * The math helpers the ported components actually reach for. Mostly copied from
 * `@studiometa/js-toolkit/utils/math`; v4 ships no `utils` yet, and this file is
 * the minimum rather than a port of the library.
 *
 * `damp()` is the exception — it is not the v3 one, see below.
 */

import { decayOver } from '../../src/math.js';

/**
 * Clamp a value in a given range.
 */
export function clamp(value: number, min: number, max: number): number {
  if (min < max) {
    return value < min ? min : value > max ? max : value;
  }
  return value < max ? max : value > min ? min : value;
}

/**
 * Clamp a value in the 0–1 range.
 */
export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

/**
 * Map a value from one range onto another.
 */
export function map(
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
): number {
  return ((value - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin) + outputMin;
}

/**
 * Interpolate a ratio between two bounds.
 */
export function lerp(min: number, max: number, ratio: number): number {
  return (1 - ratio) * min + ratio * max;
}

/**
 * Next damped value: close some of the gap to the target, and snap onto it once
 * the gap is under `precision`.
 *
 * **`elapsed` is required, and that is the whole difference from v3.** There,
 * `factor` was the fraction of the gap closed *per call*, so the speed was
 * whatever the display happened to be: measured on the v3 helper, the same
 * damping settles in 56 frames at 60 Hz and 28 at 120 Hz — twice as fast on a
 * better screen. Here `factor` is the fraction closed per `INERTIA_FRAME` (16.67 ms),
 * and the elapsed time decides how much of it this step gets. Every caller has
 * the number to hand: it is `delta` on the raf props, which the v3 call sites
 * were all discarding.
 *
 * This is the same law the drag inertia coasts on, over the same helper — a
 * factor of `0.1` closes a tenth of the gap per reference frame, so `0.9` of it
 * is retained, which is what decays. Note it is {@link decayOver} rather than
 * `inertiaDecay()`: the latter also excludes a retention of `1`, because a coast
 * that never decays has no finite destination, and here it simply means "hold
 * still".
 *
 * It is stable for anything a caller can pass, which v3's was not: at
 * `factor = 2` the gap flipped sign and oscillated forever, and above that it
 * diverged. Here an over-large factor retains nothing and closes all of the
 * gap, and a non-finite factor or elapsed time does the same rather than
 * returning `NaN`.
 */
export function damp(
  targetValue: number,
  currentValue: number,
  factor: number,
  elapsed: number,
  precision = 0.01,
): number {
  if (Math.abs(targetValue - currentValue) < precision) {
    return targetValue;
  }
  // `1 - factor` is what survives the step, which is what decays.
  const closed = 1 - decayOver(1 - factor, elapsed);
  return currentValue + (targetValue - currentValue) * closed;
}
