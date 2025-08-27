/**
 * Wrap a value in the min and max range.
 */
export function wrap(value: number, min: number, max: number): number {
  const range = max - min;
  return min === max ? min : ((range + ((value - min) % range)) % range) + min;
}
