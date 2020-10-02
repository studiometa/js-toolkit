/**
 * Round a value with a given number of decimals.
 *
 * @param  {Number} value    The number to round.
 * @param  {Number} decimals The number of decimals to keep.
 * @return {Number}          A rounded number to the given decimals length.
 */
export default function round(value) {
  var decimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return Number(value.toFixed(decimals));
}
//# sourceMappingURL=round.js.map