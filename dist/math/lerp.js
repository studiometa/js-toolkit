"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = lerp;

/**
 * Interpolate the ratio between a given interval.
 *
 * @param  {Number} min   The interval minimum value.
 * @param  {Number} max   The inverval maximum value.
 * @param  {Number} ratio The ratio to get.
 * @return {Number}       The value between min and max corresponding to ratio.
 */
function lerp(min, max, ratio) {
  return (1 - ratio) * min + ratio * max;
}
//# sourceMappingURL=lerp.js.map