/**
 * Maps the value from one range of [inputMin..inputMax] to another range of [outputMin..outputMax].
 *
 * @param  {number} value     The value to map.
 * @param  {number} inputMin  The input's minimum value.
 * @param  {number} inputMax  The input's maximum value.
 * @param  {number} outputMin The output's minimum value.
 * @param  {number} outputMax The output's maximum value.
 * @return {number}           The input value mapped to the output range.
 * @link https://js-toolkit.studiometa.dev/utils/math/map.html
*/
export function map(
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
) {
  return ((value - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin) + outputMin;
}
