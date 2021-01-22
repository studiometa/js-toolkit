/**
 * Format a CSS transform matrix with the given values.
 *
 * @param  {Object} transform
 * @param  {Number} [transform.scaleX]     The scale on the x axis.
 * @param  {Number} [transform.scaleY]     The scale on the y axis.
 * @param  {Number} [transform.skewX]      The skew on the x axis.
 * @param  {Number} [transform.skewY]      The skew on the y axis.
 * @param  {Number} [transform.translateX] The translate on the x axis.
 * @param  {Number} [transform.translateY] The translate on the y axis.
 * @return {String}                        A formatted CSS matrix transform.
 */
export default function matrix(transform) {
  // eslint-disable-next-line no-param-reassign
  transform = transform || {};
  return "matrix(".concat(transform.scaleX || 1, ", ").concat(transform.skewX || 0, ", ").concat(transform.skewY || 0, ", ").concat(transform.scaleY || 1, ", ").concat(transform.translateX || 0, ", ").concat(transform.translateY || 0, ")");
}
//# sourceMappingURL=matrix.js.map