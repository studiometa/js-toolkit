/**
 * Interpolate the ratio between a given interval.
 *
 * @param  min   The interval minimum value.
 * @param  max   The inverval maximum value.
 * @param  ratio The ratio to get.
 * @return       The value between min and max corresponding to ratio.
 * @link https://js-toolkit.studiometa.dev/utils/math/lerp.html
*/
export function lerp(min: number, max: number, ratio: number) {
  return (1 - ratio) * min + ratio * max;
}
