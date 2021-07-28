import Base from '../abstracts/Base/index.js';
import inertiaFinalValue from '../utils/math/inertiaFinalValue.js';

/**
 * @typedef {import('../services/pointer.js').PointerServiceProps} PointerServiceProps
 * @typedef {import('stylefire').Styler} Styler
 */

/**
 * @typedef {Object} DraggableOptions
 * @property {number} factor The velocity factor.
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
      factor: {
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
   * The target positiion of the inertia.
   * @type {{ x: number, y: number }}
   */
  target = {
    x: 0,
    y: 0,
  };

  /**
   * Mounted hook.
   * @return {void}
   */
  mounted() {
    // Disable ticking service on mount
    this.$services.disable('ticked');
    this.$services.disable('moved');
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
    this.target.x = x;
    this.target.y = y;

    // Enable grabbing
    this.isGrabbing = true;
    this.$emit('dragstart', this);

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

    this.target.x = inertiaFinalValue(this.x, this.delta.x, this.$options.factor);
    this.target.y = inertiaFinalValue(this.y, this.delta.y, this.$options.factor);

    this.isGrabbing = false;
    this.$emit('dragend', this);
  }

  /**
   * Raf service hook.
   * @this {Draggable & DraggableInterface}
   * @return {void}
   */
  ticked() {
    if (!this.isGrabbing) {
      this.$log('inertia');

      this.x += this.delta.x;
      this.y += this.delta.y;

      this.$emit('draginertia', this);

      this.delta.x *= this.$options.factor;
      this.delta.y *= this.$options.factor;

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
      this.delta.x = props.delta.x;
      this.delta.y = props.delta.y;
      this.target.x = props.x;
      this.target.y = props.y;

      this.$emit('drag', this);

      if (!props.isDown) {
        this.stop();
      }
    }
  }
}
