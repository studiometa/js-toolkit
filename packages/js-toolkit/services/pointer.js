import Service from './Service.js';

/**
 * @typedef {import('./index').ServiceInterface<PointerServiceProps>} PointerService
 */

/**
 * @typedef {Object} PointerServiceProps
 * @property {MouseEvent | TouchEvent} event
 * @property {boolean} isDown
 * @property {number} x
 * @property {number} y
 * @property {{ x: boolean, y: boolean }} changed
 * @property {{ x: number, y: number }} last
 * @property {{ x: number, y: number }} delta
 * @property {{ x: number, y: number }} progress
 * @property {{ x: number, y: number }} max
 */

/**
 * Test if an event is an instance of TouchEvent.
 *
 * @param {TouchEvent|MouseEvent} event The event instance to test.
 * @returns {boolean}                    Is it a TouchEvent?
 */
function isTouchEvent(event) {
  return typeof TouchEvent !== 'undefined' && event instanceof TouchEvent;
}

/**
 * Pointer service
 */
class Pointer extends Service {
  /**
   * Get the pointer props.
   *
   * @type {PointerServiceProps}
   */
  props = {
    event: null,
    isDown: false,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    changed: {
      x: false,
      y: false,
    },
    last: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    },
    delta: {
      x: 0,
      y: 0,
    },
    progress: {
      x: 0.5,
      y: 0.5,
    },
    max: {
      x: window.innerWidth,
      y: window.innerHeight,
    },
  };

  /**
   * Whether or not the raf service is running.
   * @type {boolean}
   */
  hasRaf = false;

  /**
   * Bind the handler to the mousemove and touchmove events.
   * Bind the up and down handler to the mousedown, mouseup, touchstart and touchend events.
   *
   * @returns {this}
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
   * @returns {this}
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
    this.updateProps(event);
    this.trigger(this.props);
  }

  /**
   * Handler for the pointer's down action.
   *
   * @returns {void}
   */
  downHandler() {
    this.props.isDown = true;
    this.trigger(this.props);
  }

  /**
   * Handler for the pointer's up action.
   *
   * @returns {void}
   */
  upHandler() {
    this.props.isDown = false;
    this.trigger(this.props);
  }

  /**
   * Update the pointer positions.
   *
   * @param  {MouseEvent|TouchEvent} event The event object.
   * @returns {PointerServiceProps}
   */
  updateProps(event) {
    this.props.event = event;
    const yLast = this.props.y;
    const xLast = this.props.x;

    // Check pointer Y
    // We either get data from a touch event `event.touches[0].clientY` or from
    // a mouse event `event.clientY`.
    const y = isTouchEvent(event)
      ? /** @type {TouchEvent} */ (event).touches[0]?.clientY
      : /** @type {MouseEvent} */ (event).clientY;
    if (y !== this.props.y) {
      this.props.y = y;
    }

    // Check pointer X
    // We either get data from a touch event `event.touches[0].clientX` or from
    // a mouse event `event.clientX`.
    const x = isTouchEvent(event)
      ? /** @type {TouchEvent} */ (event).touches[0]?.clientX
      : /** @type {MouseEvent} */ (event).clientX;
    if (x !== this.props.x) {
      this.props.x = x;
    }

    this.props.changed.x = this.props.x !== xLast;
    this.props.changed.y = this.props.y !== yLast;

    this.props.last.x = xLast;
    this.props.last.y = yLast;

    this.props.delta.x = this.props.x - xLast;
    this.props.delta.y = this.props.y - yLast;

    this.props.max.x = window.innerWidth;
    this.props.max.y = window.innerHeight;

    this.props.progress.x = this.props.x / this.props.max.x;
    this.props.progress.y = this.props.y / this.props.max.y;

    return this.props;
  }
}

/**
 * @type {Pointer}
 */
let instance;

/**
 * @type {PointerService}
 */
let pointer;

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
 * @todo Add element as parameter to get the pointer position relatively from.
 * @returns {PointerService}
 */
export default function usePointer() {
  if (!pointer) {
    if (!instance) {
      instance = new Pointer();
    }

    pointer = {
      add: instance.add.bind(instance),
      remove: instance.remove.bind(instance),
      has: instance.has.bind(instance),
      props: instance.updateProps.bind(instance),
    };
  }
  return pointer;
}
