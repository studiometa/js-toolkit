/**
 * The five math helpers the ported components actually reach for, copied
 * verbatim from `@studiometa/js-toolkit/utils/math`. v4 ships no `utils`
 * yet; this file is the minimum, not a port of the library.
 */

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
 * Next damped value for a given factor, snapping to the target once it is
 * within `precision`.
 */
export function damp(
  targetValue: number,
  currentValue: number,
  factor = 0.5,
  precision = 0.01,
): number {
  return Math.abs(targetValue - currentValue) < precision
    ? targetValue
    : currentValue + (targetValue - currentValue) * factor;
}
