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
export default function matrix(t) {
  // eslint-disable-next-line no-param-reassign
  t = t || {};
  return `matrix(${t.scaleX || 1}, ${t.skewX || 0}, ${t.skewY || 0}, ${t.scaleY ||
    1}, ${t.translateX || 0}, ${t.translateY || 0})`;
}
