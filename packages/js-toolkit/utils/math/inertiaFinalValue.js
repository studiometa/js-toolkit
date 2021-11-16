/**
 * Get the final damped value for a given factor.
 *
 * @param  {Number} initialValue The final value.
 * @param  {Number} initialDelta The current value.
 * @param  {Number=} [dampFactor=0.85] The speed to reach the target value.
 * @return {Number} The next value.
 */
export default function inertiaFinalValue(initialValue, initialDelta, dampFactor = 0.85) {
  if (dampFactor >= 1 || dampFactor <= 0) {
    throw new Error(
      `The \`factor\` parameter must be a number greater than 0 and smaller than 1, \`${dampFactor}\` given.`
    );
  }

  let delta = initialDelta;
  let finalValue = initialValue;

  while (Math.abs(delta) > 0.1) {
    finalValue += delta;
    delta *= dampFactor;
  }

  return finalValue;
}
