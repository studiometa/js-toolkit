import styler from 'stylefire';
import Base from '../abstracts/Base/index.js';

/**
 * @typedef {import('../services/pointer.js').PointerServiceProps} PointerServiceProps
 * @typedef {import('stylefire').Styler} Styler
 */

/**
 * @typedef {Object} DraggableOptions
 * @property {boolean} move Whether to move the element or not.
 * @property {number} velocity The velocity factor.
 */

/**
 * @typedef {Object} DraggableInterface
 * @property {DraggableOptions} $options
 */

/**
 * Draggable class.
 *
 * @link https://jsfiddle.net/soulwire/znj683b9/
 */
export default class Draggable extends Base {
  static config = {
    name: 'Draggable',
    options: {
      move: Boolean,
      velocity: {
        type: Number,
        default: 0.85,
      },
    },
  };

  /**
   * Whether we are currently dragging or not.
   * @type {Boolean}
   */
  isGrabbing = false;

  /**
   * The horizontal position of the drag.
   * @type {Number}
   */
  x = 0;

  /**
   * The vertical position of the drag.
   * @type {Number}
   */
  y = 0;

  /**
   * The velocity of the drag.
   * @type {{ x: number, y: number }}
   */
  delta = {
    x: 0,
    y: 0,
  };

  /**
   * The origin of the drag.
   * @type {{ x: number, y: number }}
   */
  origin = {
    x: 0,
    y: 0,
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
    if (this.$options.move) {
      this.styler = styler(this.$el);
    }

    // Disable ticking service on mount
    this.$services.disable('ticked');
    this.$services.disable('moved');
  }

  /**
   * Destroyed hook.
   * @return {void}
   */
  destroyed() {
    this.styler = undefined;
  }

  /**
   * Mousedown handler.
   * @param {MouseEvent} event The event object.
   * @return {void}
   */
  onMousedown(event) {
    this.start(event.clientX, event.clientY);
  }

  /**
   * Touchstart handler.
   * @param {TouchEvent} event The event object.
   * @return {void}
   */
  onTouchstart(event) {
    this.start(event.touches[0].clientX, event.touches[0].clientY);
  }

  /**
   * Start the drag.
   * @this {Draggable & DraggableInterface}
   * @param {number} x The initial horizontal position.
   * @param {number} y The initial vertical position.
   * @return {void}
   */
  start(x, y) {
    this.$log('start');

    // Reset state
    this.x = x;
    this.y = y;
    this.origin.x = x;
    this.origin.y = y;
    this.delta.x = 0;
    this.delta.y = 0;

    // Enable grabbing
    this.isGrabbing = true;
    this.$el.classList.add('cursor-grabbing');
    this.$emit('dragstart', this);

    if (this.$options.move) {
      this.elementOrigin.x = this.styler.get('x');
      this.elementOrigin.y = this.styler.get('y');
    }

    setTimeout(() => {
      this.$services.enable('moved');
      this.$services.enable('ticked');
    }, 0);
  }

  /**
   * Stop the drag.
   * @return {void}
   */
  stop() {
    this.$log('stop');
    this.$services.disable('moved');
    this.isGrabbing = false;
    this.$el.classList.remove('cursor-grabbing');
    this.$emit('dragend', this);
  }

  /**
   * Raf service hook.
   * @this {Draggable & DraggableInterface}
   * @return {void}
   */
  ticked() {
    if (this.$options.move) {
      this.styler.set({
        x: this.elementOrigin.x + this.x - this.origin.x,
        y: this.elementOrigin.y + this.y - this.origin.y,
      });
    }

    if (!this.isGrabbing) {
      this.$log('inertia');
      this.x += this.delta.x;
      this.y += this.delta.y;

      this.$emit('draginertia', this);

      this.delta.x *= this.$options.velocity;
      this.delta.y *= this.$options.velocity;

      if (Math.abs(this.delta.x) < 0.1 && Math.abs(this.delta.y) < 0.1) {
        this.$services.disable('ticked');
      }
    }
  }

  /**
   * Pointer service hook.
   * @param {PointerServiceProps} props [description]
   * @return {void}
   */
  moved(props) {
    if (this.isGrabbing) {
      this.x = props.x;
      this.y = props.y;
      this.delta.x = props.event.movementX;
      this.delta.y = props.event.movementY;
      this.$emit('drag', this);

      if (!props.isDown) {
        this.stop();
      }
    }
  }
}
