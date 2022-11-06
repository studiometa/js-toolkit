/**
 * Round a value with a given number of decimals.
 *
 * @param   {number} value The number to round.
 * @param   {number} [decimals=0] The number of decimals to keep.
 * @returns {number} A rounded number to the given decimals length.
 */
export default function round(value:number, decimals = 0) {
  return Number(value.toFixed(decimals));
}
