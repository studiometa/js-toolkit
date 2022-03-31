/**
 * @typedef {Object} Circle
 * @property {number} x Circle's x position
 * @property {number} y Circle's y position
 * @property {number} radius Circle's radius
 */

/**
 * Convert clientRect to a formatted circle object
 *
 * @param {Partial<DOMRect>} domRect DOMRect of a square DOMElement
 * @param {boolean} force Force usage of non-square DOMElements
 * @returns {Circle} Circle object that can be used in collides functions
 */
export default function boundingRectToCircle({ x, y, width, height }, force = false) {
  if (width !== height && !force)
    throw new Error('Initial DOMElement is not a square. Please use the force mode.');
  return {
    x: x + width / 2,
    y: y + height / 2,
    radius: (width + height) / 4,
  };
}
