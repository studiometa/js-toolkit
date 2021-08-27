/**
 * Get the next damped value for a given factor.
 */
export default function damp(targetValue:number, currentValue:number, factor = 0.5):number {
  return Math.abs(targetValue - currentValue) < 0.001
    ? targetValue
    : currentValue + (targetValue - currentValue) * factor;
}
