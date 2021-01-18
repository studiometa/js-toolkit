/**
 * Smooth step from currentValue to targetValue
 *
 * @param  {Number} targetValue we want to reech
 * @param  {Number} currentValue
 * @param  {Number} speed to reech target value
 * @return {Number}
 */
export default function damp(targetValue, currentValue, speed = 0.5) {
  const value = currentValue + (targetValue - currentValue) * speed;
  return Math.abs(targetValue - currentValue) < 0.001 ? targetValue : value;
}
