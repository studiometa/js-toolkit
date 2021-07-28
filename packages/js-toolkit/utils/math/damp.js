/**
 * Get the next damped value for a given factor.
 *
 * @param  {Number} targetValue The final value.
 * @param  {Number} currentValue The current value.
 * @param  {Number=} [factor=0.5] The factor used to reach the target value.
 * @return {Number} The next value.
 */
export default function damp(targetValue, currentValue, factor = 0.5) {
  return Math.abs(targetValue - currentValue) < 0.001
    ? targetValue
    : currentValue + (targetValue - currentValue) * factor;
}
