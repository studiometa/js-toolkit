"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = matrix;

/**
 * Format a CSS transform matrix with the given values.
 *
 * @param  {Number} options.scaleX     The scale on the x axis.
 * @param  {Number} options.scaleY     The scale on the y axis.
 * @param  {Number} options.skewX      The skew on the x axis.
 * @param  {Number} options.skewY      The skew on the y axis.
 * @param  {Number} options.translateX The translate on the x axis.
 * @param  {Number} options.translateY The translate on the y axis.
 * @return {String}                    A formatted CSS matrix transform.
 */
function matrix(t) {
  // eslint-disable-next-line no-param-reassign
  t = t || {};
  return "matrix(".concat(t.scaleX || 1, ", ").concat(t.skewX || 0, ", ").concat(t.skewY || 0, ", ").concat(t.scaleY || 1, ", ").concat(t.translateX || 0, ", ").concat(t.translateY || 0, ")");
}
//# sourceMappingURL=matrix.js.map