/**
 * Get the final damped value for a given factor.
 *
 * @param  {Number} initialValue The final value.
 * @param  {Number} initialDelta The current value.
 * @param  {Number=} [factor=0.85] The speed to reach the target value.
 * @return {Number} The next value.
 */
export default function inertiaFinalValue(initialValue, initialDelta, factor = 0.85) {
  if (factor >= 1 || factor <= 0) {
    throw new Error(
      `The \`factor\` parameter must be a number greater than 0 and smaller than 1, \`${factor}\` given.`
    );
  }

  let delta = initialDelta;
  let finalValue = initialValue;

  while (Math.abs(delta) > 0.1) {
    finalValue += delta;
    delta *= factor;
  }

  return finalValue;
}
