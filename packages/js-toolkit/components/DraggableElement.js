import styler from 'stylefire';
import Draggable from './Draggable.js';

/**
 * @typedef {import('stylefire').Styler} Styler
 */

/**
 * Draggable class.
 *
 * @link https://jsfiddle.net/soulwire/znj683b9/
 */
export default class DraggableElement extends Draggable {
  static config = {
    ...Draggable.config,
    name: 'DraggableElement',
  };

  /**
   * The origin of the element.
   * @type {{ x: number, y: number }}
   */
  elementOrigin = {
    x: 0,
    y: 0,
  };

  /**
   * The element styler for performant style update.
   * @type {Styler}
   */
  styler;

  /**
   * Mounted hook.
   * @return {void}
   */
  mounted() {
    super.mounted();
    this.styler = styler(this.$el);
  }

  /**
   * Destroyed hook.
   * @return {void}
   */
  destroyed() {
    this.styler = undefined;
  }

  /**
   * Start the drag.
   * @param {number} x The initial horizontal position.
   * @param {number} y The initial vertical position.
   * @return {void}
   */
  start(x, y) {
    super.start(x, y);
    this.elementOrigin.x = this.styler.get('x');
    this.elementOrigin.y = this.styler.get('y');
  }

  /**
   * Raf service hook.
   * @return {void}
   */
  ticked() {
    super.ticked();
    this.styler.set({
      x: this.elementOrigin.x + this.x - this.origin.x,
      y: this.elementOrigin.y + this.y - this.origin.y,
    });
  }
}
