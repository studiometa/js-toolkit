import Service from './Service.js';

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
   * Bind the handler to the mousemove and touchmove events.
   * Bind the up and down handler to the mousedown, mouseup, touchstart and touchend events.
   *
   * @return {Pointer}
   */
  init() {
    document.documentElement.addEventListener('mouseenter', this, {
      once: true,
      capture: true,
    });

    const options = { passive: true, capture: true };
    document.addEventListener('mousemove', this, options);
    document.addEventListener('touchmove', this, options);
    document.addEventListener('mousedown', this, options);
    document.addEventListener('touchstart', this, options);
    document.addEventListener('mouseup', this, options);
    document.addEventListener('touchend', this, options);
    return this;
  }

  /**
   * Handle events.
   * @param {MouseEvent|TouchEvent} event The event object.
   */
  handleEvent(event) {
    // eslint-disable-next-line default-case
    switch (event.type) {
      case 'mouseenter':
      case 'mousemove':
      case 'touchmove':
        this.handler(event);
        break;
      case 'mousedown':
      case 'touchstart':
        this.downHandler();
        break;
      case 'mouseup':
      case 'touchend':
        this.upHandler();
        break;
    }
  }

  /**
   * Unbind all handlers from their bounded event.
   *
   * @return {Pointer}
   */
  kill() {
    document.removeEventListener('mousemove', this);
    document.removeEventListener('touchmove', this);
    document.removeEventListener('mousedown', this);
    document.removeEventListener('touchstart', this);
    document.removeEventListener('mouseup', this);
    document.removeEventListener('touchend', this);
    return this;
  }

  /**
   * The service handler.
   * @param {MouseEvent|TouchEvent} event The mouse event object.
   */
  handler(event) {
    this.updateValues(event);
    this.trigger(this.props);
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
