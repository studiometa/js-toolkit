/**
 * @typedef {Object} Rect
 * @property {number} x Rectangle's x position
 * @property {number} y Rectangle's y position
 * @property {number} width Rectangle's width
 * @property {number} height Rectangle's height
 */

/**
 * Test if a rectangle collides with another rectangle.
 * Inspired by http://www.jeffreythompson.org/collision-detection/rect-rect.php
 *
 * @param {Rect} rect1 Rectangle 1
 * @param {Rect} rect2 Rectangle 2
 * @return {boolean} Are the sides of one rectangle touching the other ?
 * @link https://js-toolkit.studiometa.dev/utils/collision/collideRectRect.html
*/
export function collideRectRect(rect1, rect2) {
  return (
    rect1.x + rect1.width >= rect2.x && // rect1 right edge past rect2 left AND
    rect1.x <= rect2.x + rect2.width && // rect1 left edge past rect2 right AND
    rect1.y + rect1.height >= rect2.y && // rect1 top edge past rect2 bottom AND
    rect1.y <= rect2.y + rect2.height // rect1 bottom edge past rect2 top
  );
}
