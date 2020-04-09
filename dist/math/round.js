"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = round;

/**
 * Round a value with a given number of decimals.
 *
 * @param  {Number} value    The number to round.
 * @param  {Number} decimals The number of decimals to keep.
 * @return {Number}          A rounded number to the given decimals length.
 */
function round(value) {
  var decimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
//# sourceMappingURL=round.js.map