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
  return `matrix(${transform.scaleX || 1}, ${transform.skewX || 0}, ${transform.skewY || 0}, ${
    transform.scaleY || 1
  }, ${transform.translateX || 0}, ${transform.translateY || 0})`;
}
