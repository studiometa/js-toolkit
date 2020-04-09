/**
 * Round a value with a given number of decimals.
 *
 * @param  {Number} value    The number to round.
 * @param  {Number} decimals The number of decimals to keep.
 * @return {Number}          A rounded number to the given decimals length.
 */
export default function round(value, decimals = 0) {
  return Number(value.toFixed(decimals));
}
