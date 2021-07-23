import Service from '../abstracts/Service.js';
import throttle from '../utils/throttle.js';
import debounce from '../utils/debounce.js';
import useRaf from './raf.js';

/**
 * @typedef {import('./index').ServiceInterface} ServiceInterface
 */

/**
 * @typedef {Object} PointerServiceProps
 * @property {MouseEvent | TouchEvent} event
 * @property {Boolean} isDown
 * @property {Number} x
 * @property {Number} y
 * @property {{ x: Boolean, y: Boolean }} changed
 * @property {{ x: Number, y: Number }} last
 * @property {{ x: Number, y: Number }} delta
 * @property {{ x: Number, y: Number }} progress
 * @property {{ x: Number, y: Number }} max
 */

/**
 * @typedef {Object} PointerService
 * @property {(key:String, callback:(props:PointerServiceProps) => void) => void} add
 *   Add a function to the resize service. The key must be uniq.
 * @property {() => PointerServiceProps} props
 *   Get the current values of the resize service props.
 */

/**
 * Test if an event is an instance of TouchEvent.
 *
 * @param {TouchEvent|MouseEvent} event The event instance to test.
 * @return {Boolean}                    Is it a TouchEvent?
 */
function isTouchEvent(event) {
  return typeof TouchEvent !== 'undefined' && event instanceof TouchEvent;
}

/**
 * Pointer service
 */
class Pointer extends Service {
  /** @type {Boolean} State of the pointer. */
  isDown = false;

  /** @type {Number} The y pointer position. */
  y = window.innerHeight / 2;

  /** @type {Number} The y previous pointer position. */
  yLast = window.innerHeight / 2;

  /** @type {Number} The x pointer position. */
  x = window.innerWidth / 2;

  /** @type {Number} The x previous pointer position. */
  xLast = window.innerWidth / 2;

  /** @type {MouseEvent|TouchEvent} The latest event emitted from the pointer. */
  event;

  /**
   * Whether or not the raf service is running.
   * @type {Boolean}
   */
  hasRaf = false;

  /**
   * The service handler.
   * @type {(this:Document, event:MouseEvent) => any}
   */
  handler;

  /**
   * Bind the handler to the mousemove and touchmove events.
   * Bind the up and down handler to the mousedown, mouseup, touchstart and touchend events.
   *
   * @return {Pointer}
   */
  init() {
    const { add, remove } = useRaf();
    this.hasRaf = false;

    const debounced = debounce((event) => {
      this.updateValues(event);
      remove('usePointer');
      this.trigger(this.props);
      this.hasRaf = false;
    }, 50);

    this.handler = throttle((event) => {
      this.updateValues(event);
      if (!this.hasRaf) {
        add('usePointer', () => {
          this.trigger(this.props);
        });
        this.hasRaf = true;
      }
      // Reset changed flags at the end of the mousemove or touchmove event
      debounced(event);
    }, 32).bind(this);

    this.downHandler = this.downHandler.bind(this);
    this.upHandler = this.upHandler.bind(this);

    document.documentElement.addEventListener('mouseenter', this.handler, {
      once: true,
      capture: true,
    });

    const options = { passive: true, capture: true };

    document.addEventListener('mousemove', this.handler, options);
    document.addEventListener('touchmove', this.handler, options);
    document.addEventListener('mousedown', this.downHandler, options);
    document.addEventListener('touchstart', this.downHandler, options);
    document.addEventListener('mouseup', this.upHandler, options);
    document.addEventListener('touchend', this.upHandler, options);
    return this;
  }

  /**
   * Unbind all handlers from their bounded event.
   *
   * @return {Pointer}
   */
  kill() {
    document.removeEventListener('mousemove', this.handler);
    document.removeEventListener('touchmove', this.handler);
    document.removeEventListener('mousedown', this.downHandler);
    document.removeEventListener('touchstart', this.downHandler);
    document.removeEventListener('mouseup', this.upHandler);
    document.removeEventListener('touchend', this.upHandler);
    return this;
  }

  /**
   * Handler for the pointer's down action.
   *
   * @return {void}
   */
  downHandler() {
    this.isDown = true;
    this.trigger(this.props);
  }

  /**
   * Handler for the pointer's up action.
   *
   * @return {void}
   */
  upHandler() {
    this.isDown = false;
    this.trigger(this.props);
  }

  /**
   * Update the pointer positions.
   *
   * @param  {MouseEvent|TouchEvent} event The event object.
   * @return {void}
   */
  updateValues(event) {
    this.event = event;
    this.yLast = this.y;
    this.xLast = this.x;

    // Check pointer Y
    // We either get data from a touch event `event.touches[0].clientY` or from
    // a mouse event `event.clientY`.
    const y = isTouchEvent(event)
      ? /** @type {TouchEvent} */ (event).touches[0]?.clientY
      : /** @type {MouseEvent} */ (event).clientY;
    if (y !== this.y) {
      this.y = y;
    }

    // Check pointer X
    // We either get data from a touch event `event.touches[0].clientX` or from
    // a mouse event `event.clientX`.
    const x = isTouchEvent(event)
      ? /** @type {TouchEvent} */ (event).touches[0]?.clientX
      : /** @type {MouseEvent} */ (event).clientX;
    if (x !== this.x) {
      this.x = x;
    }
  }

  /**
   * Get the pointer props.
   *
   * @type {Object}
   */
  get props() {
    return {
      event: this.event,
      isDown: this.isDown,
      x: this.x,
      y: this.y,
      changed: {
        x: this.x !== this.xLast,
        y: this.y !== this.yLast,
      },
      last: {
        x: this.xLast,
        y: this.yLast,
      },
      delta: {
        x: this.x - this.xLast,
        y: this.y - this.yLast,
      },
      progress: {
        x: this.x / window.innerWidth,
        y: this.y / window.innerHeight,
      },
      max: {
        x: window.innerWidth,
        y: window.innerHeight,
      },
    };
  }
}

let pointer = null;

/**
 * Use the pointer.
 *
 * ```js
 * import usePointer from '@studiometa/js-toolkit/services';
 * const { add, remove, props } = usePointer();
 * add('id', () => {});
 * remove('id');
 * props();
 * ```
 *
 * @return {ServiceInterface & PointerService}
 */
export default function usePointer() {
  if (!pointer) {
    pointer = new Pointer();
  }

  const add = pointer.add.bind(pointer);
  const remove = pointer.remove.bind(pointer);
  const has = pointer.has.bind(pointer);
  const props = () => pointer.props;

  return {
    add,
    remove,
    has,
    props,
  };
}
