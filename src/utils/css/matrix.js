/**
 * Format a CSS transform matrix with the given values.
 *
 * @param  {Object}  transform
 * @param  {Number=} [transform.scaleX=1]     The scale on the x axis.
 * @param  {Number=} [transform.scaleY=1]     The scale on the y axis.
 * @param  {Number=} [transform.skewX=0]      The skew on the x axis.
 * @param  {Number=} [transform.skewY=0]      The skew on the y axis.
 * @param  {Number=} [transform.translateX=0] The translate on the x axis.
 * @param  {Number=} [transform.translateY=0] The translate on the y axis.
 * @return {String}                           A formatted CSS matrix transform.
 *
 * @example
 * ```js
 * matrix({ scaleX: 0.5, scaleY: 0.5 });
 * // matrix(0.5, 0, 0, 0.5, 0, 0)
 * ```
 */
export default function matrix(transform) {
  // eslint-disable-next-line no-param-reassign
  transform = transform || {};
  return `matrix(${transform.scaleX || 1}, ${transform.skewX || 0}, ${transform.skewY || 0}, ${
    transform.scaleY || 1
  }, ${transform.translateX || 0}, ${transform.translateY || 0})`;
}
