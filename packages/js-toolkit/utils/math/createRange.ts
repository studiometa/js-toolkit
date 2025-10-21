/**
 * Create an array from a given range and with the given incremental step.
 * @link https://js-toolkit.studiometa.dev/utils/math/createRange.html
*/
export function createRange(min: number, max: number, step: number): number[] {
  const result: number[] = [];
  let value = min;

  while (value <= max) {
    result.push(value);
    value += step;
  }

  return result;
}
