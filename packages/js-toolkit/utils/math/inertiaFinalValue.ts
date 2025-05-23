import { clamp } from './clamp.js';

/**
 * Get the final damped value for a given factor.
 *
 * @param   {number} initialValue The final value.
 * @param   {number} initialDelta The current value.
 * @param   {number} [dampFactor=0.85] The speed to reach the target value.
 * @returns {number} The next value.
 */
export function inertiaFinalValue(initialValue: number, initialDelta: number, dampFactor = 0.85) {
  // eslint-disable-next-line no-param-reassign
  dampFactor = clamp(dampFactor, 0.00001, 0.99999);
  let delta = initialDelta;
  let finalValue = initialValue;

  while (Math.abs(delta) > 0.1) {
    finalValue += delta;
    delta *= dampFactor;
  }

  return finalValue;
}
