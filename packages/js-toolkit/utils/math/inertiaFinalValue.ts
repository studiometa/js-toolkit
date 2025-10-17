import { clamp } from './clamp.js';

/**
 * Get the final damped value for a given factor.
 *
 * @param   initialValue The final value.
 * @param   initialDelta The current value.
 * @param   [dampFactor=0.85] The speed to reach the target value, defaults to `0.85`.
 * @returns The next value.
 * @link https://js-toolkit.studiometa.dev/utils/math/inertiaFinalValue.html
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
