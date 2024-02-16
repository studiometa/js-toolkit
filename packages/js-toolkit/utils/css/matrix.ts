type MatrixTransform = {
  scaleX?: number;
  scaleY?: number;
  skewX?: number;
  skewY?: number;
  translateX?: number;
  translateY?: number;
};

/**
 * Format a CSS transform matrix with the given values.
 *
 * @param   {Object} transform
 * @param   {number} [transform.scaleX=1]     The scale on the x axis.
 * @param   {number} [transform.scaleY=1]     The scale on the y axis.
 * @param   {number} [transform.skewX=0]      The skew on the x axis.
 * @param   {number} [transform.skewY=0]      The skew on the y axis.
 * @param   {number} [transform.translateX=0] The translate on the x axis.
 * @param   {number} [transform.translateY=0] The translate on the y axis.
 * @returns {string}                           A formatted CSS matrix transform.
 * @example
 * ```js
 * matrix({ scaleX: 0.5, scaleY: 0.5 });
 * // matrix(0.5, 0, 0, 0.5, 0, 0)
 * ```
 */
export default function matrix(transform?: MatrixTransform): string {
  // eslint-disable-next-line no-param-reassign
  transform = transform || {};
  return `matrix(${transform.scaleX ?? 1}, ${transform.skewY ?? 0}, ${transform.skewX ?? 0}, ${
    transform.scaleY ?? 1
  }, ${transform.translateX ?? 0}, ${transform.translateY ?? 0})`;
}
