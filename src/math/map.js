/**
 * Maps the value from one range of [inputMin..inputMax] to another range of [outputMin..outputMax].
 *
 * @param  {Number} value     The value to map.
 * @param  {Number} inputMin  The input's minimum value.
 * @param  {Number} inputMax  The input's maximum value.
 * @param  {Number} ouptutMin The output's minimum value.
 * @param  {Number} outputMax The intput's maximum value.
 * @return {Number}           The input value mapped to the output range.
 */
export default function map(value, inputMin, inputMax, outputMin, outputMax) {
  return ((value - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin) + outputMin;
}
