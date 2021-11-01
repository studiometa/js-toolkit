/**
 * Get the next damped value for a given factor.
 *
 * @param  {number} targetValue The final value.
 * @param  {number} currentValue The current value.
 * @param  {number=} [factor=0.5] The factor used to reach the target value.
 * @param  {number=} [precision=0.01] The precision used to calculate the latest value.
 * @return {number} The next value.
 */
export default function damp(targetValue, currentValue, factor = 0.5, precision = 0.01) {
  return Math.abs(targetValue - currentValue) < precision
    ? targetValue
    : currentValue + (targetValue - currentValue) * factor;
}
