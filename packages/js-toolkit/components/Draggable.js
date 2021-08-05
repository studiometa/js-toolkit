import styler from 'stylefire';
import Base from '../abstracts/Base/index.js';
import withDrag from '../decorators/withDrag.js';

/**
 * @typedef {import('stylefire').Styler} Styler
 * @typedef {import('../services/drag.js').DragServiceProps} DragServiceProps
 */

/**
 * Draggable class.
 *
 * @link https://jsfiddle.net/soulwire/znj683b9/
 */
export default class Draggable extends withDrag(Base) {
  static config = {
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
   * Drag service hook.
   * @param {DragServiceProps} props
   */
  dragged(props) {
    if (props.mode === 'start') {
      this.elementOrigin.x = this.styler.get('x');
      this.elementOrigin.y = this.styler.get('y');
      return;
    }

    this.styler.set({
      x: this.elementOrigin.x + props.x - props.origin.x,
      y: this.elementOrigin.y + props.y - props.origin.y,
    });
  }
}
