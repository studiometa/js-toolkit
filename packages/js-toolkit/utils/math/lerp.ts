/**
 * Interpolate the ratio between a given interval.
 *
 * @param  {number} min   The interval minimum value.
 * @param  {number} max   The inverval maximum value.
 * @param  {number} ratio The ratio to get.
 * @returns {number}       The value between min and max corresponding to ratio.
 */
export default function lerp(min: number, max: number, ratio: number) {
  return (1 - ratio) * min + ratio * max;
}
