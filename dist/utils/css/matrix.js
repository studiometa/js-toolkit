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
export default function matrix(transform) {
  // eslint-disable-next-line no-param-reassign
  transform = transform || {};
  return "matrix(".concat(transform.scaleX || 1, ", ").concat(transform.skewX || 0, ", ").concat(transform.skewY || 0, ", ").concat(transform.scaleY || 1, ", ").concat(transform.translateX || 0, ", ").concat(transform.translateY || 0, ")");
}
//# sourceMappingURL=matrix.js.map