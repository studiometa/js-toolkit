/** Time-based functions take elapsed milliseconds. */

/** The default inertia factor. */
export const DEFAULT_DAMP_FACTOR = 0.85;

/** The 60 Hz reference frame for damping factors, in milliseconds. */
export const INERTIA_FRAME = 1000 / 60;

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
 * Wrap a value in a range: it leaves by one bound and comes back by the other.
 */
export function wrap(value: number, min: number, max: number): number {
  const range = max - min;

  if (!Number.isFinite(range)) {
    return value;
  }

  return min === max ? min : ((range + ((value - min) % range)) % range) + min;
}

/**
 * Fold a value back and forth in a range: it bounces off both bounds.
 */
export function fold(value: number, min: number, max: number): number {
  const range = max - min;

  if (!Number.isFinite(range) || range <= 0) {
    return min;
  }

  const wrapped = wrap(value, min, min + range * 2);
  return wrapped > max ? 2 * max - wrapped : wrapped;
}

/**
 * Round a value to the given number of decimals.
 */
export function round(value: number, decimals = 0): number {
  return Number(value.toFixed(decimals));
}

/**
 * The arithmetic mean of the given numbers. An empty list averages to `0`.
 */
export function mean(numbers: readonly number[]): number {
  if (numbers.length === 0) {
    return 0;
  }

  let sum = 0;
  for (const value of numbers) {
    sum += value;
  }
  return sum / numbers.length;
}

/**
 * The values from `min` up to `max`, one step apart.
 *
 * Each value is computed from the index rather than accumulated, so a
 * fractional step does not drift. A step which is not positive and finite
 * describes no range and returns an empty array.
 */
export function createRange(min: number, max: number, step: number): number[] {
  if (!Number.isFinite(step) || step <= 0 || !Number.isFinite(max - min) || max < min) {
    return [];
  }

  const count = Math.floor((max - min) / step) + 1;
  return Array.from({ length: count }, (_, index) => min + index * step);
}

/**
 * Return the fraction retained after `elapsed` milliseconds.
 *
 * Retention is clamped to `[0, 1]`, elapsed time to non-negative values, and non-finite inputs return `0`.
 */
export function decayOver(retained: number, elapsed: number): number {
  if (!Number.isFinite(retained) || !Number.isFinite(elapsed)) {
    return 0;
  }
  return Math.min(Math.max(retained, 0), 1) ** (Math.max(elapsed, 0) / INERTIA_FRAME);
}

/** Return the next time-based damped value and snap within `precision`. */
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

/** Clamp an inertia damping factor to a finite decaying range. */
export function clampDampFactor(factor: number): number {
  if (!Number.isFinite(factor)) {
    return DEFAULT_DAMP_FACTOR;
  }
  return Math.min(Math.max(factor, 0), 0.99999);
}

/** Return the velocity fraction retained after elapsed time. */
export function inertiaDecay(dampFactor: number, elapsed: number): number {
  return decayOver(clampDampFactor(dampFactor), elapsed);
}

/** Return the inertia decay time constant in milliseconds. */
export function inertiaTimeConstant(dampFactor: number): number {
  return INERTIA_FRAME / Math.log(1 / clampDampFactor(dampFactor));
}

/** Integrate one inertia step exactly for velocity in pixels per millisecond. */
export function inertiaStep(velocity: number, dampFactor: number, elapsed: number): number {
  return velocity * inertiaTimeConstant(dampFactor) * (1 - inertiaDecay(dampFactor, elapsed));
}

/**
 * Return the exact coast destination for velocity in pixels per millisecond. The destination remains invariant during the coast.
 */
export function inertiaFinalValue(value: number, velocity: number, dampFactor: number): number {
  return value + velocity * inertiaTimeConstant(dampFactor);
}

/** Fixed spring integration step in milliseconds. */
const SPRING_STEP = INERTIA_FRAME / 4;

/** Largest stable `stiffness / mass` ratio for {@link SPRING_STEP}. */
export const MAX_SPRING_RATIO = (4 / (SPRING_STEP / INERTIA_FRAME) ** 2) * 0.9;

export interface SpringOptions {
  /** Pull towards the target, per {@link INERTIA_FRAME}. Defaults to `0.1`. */
  stiffness?: number;
  /** Velocity retained per {@link INERTIA_FRAME}, the friction. Defaults to `0.6`. */
  damping?: number;
  /** Resistance to acceleration. Defaults to `1`. */
  mass?: number;
  /** Distance and velocity under which the spring is at rest. Defaults to `1e-4`. */
  precision?: number;
}

/**
 * Advance a spring by elapsed milliseconds with fixed, bounded substeps. Stiffness-to-mass ratio is clamped for stability.
 *
 * Returns the exact target and zero velocity within `precision`.
 */
export function spring(
  targetValue: number,
  currentValue: number,
  currentVelocity: number,
  elapsed: number,
  options: SpringOptions = {},
): [value: number, velocity: number] {
  const { stiffness = 0.1, damping = 0.6, mass = 1, precision = 1 / 1e4 } = options;

  if (!Number.isFinite(elapsed) || elapsed <= 0) {
    return [currentValue, currentVelocity];
  }

  let value = currentValue;
  let velocity = currentVelocity;
  // Bound catch-up work after long pauses.
  const budget = Math.min(elapsed, 10 * INERTIA_FRAME);
  const retained = decayOver(damping, SPRING_STEP);
  const ratio = Number.isFinite(stiffness / mass)
    ? Math.min(Math.max(stiffness / mass, 0), MAX_SPRING_RATIO)
    : 0.1;
  const pull = ratio * (SPRING_STEP / INERTIA_FRAME);

  for (let spent = 0; spent < budget; spent += SPRING_STEP) {
    velocity = velocity * retained + (targetValue - value) * pull;
    value += velocity * (SPRING_STEP / INERTIA_FRAME);
  }

  if (Math.abs(targetValue - value) < precision && Math.abs(velocity) < precision) {
    return [targetValue, 0];
  }
  return [value, velocity];
}
