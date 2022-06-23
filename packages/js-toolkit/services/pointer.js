/* eslint-disable no-use-before-define */
import { useService } from './useService.js';

/**
 * @typedef {import('./index').ServiceInterface<PointerServiceProps>} PointerService
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

const events = ['mousemove', 'touchmove', 'mousedown', 'touchstart', 'mouseup', 'touchend'];

/**
 * Get pointer service.
 * @returns {PointerService}
 */
function createPointerService() {
  /**
   * Update the pointer positions.
   *
   * @param  {MouseEvent|TouchEvent} event The event object.
   * @returns {PointerServiceProps}
   */
  function updateProps(event) {
    props.event = event;
    const yLast = props.y;
    const xLast = props.x;

    // Check pointer Y
    // We either get data from a touch event `event.touches[0].clientY` or from
    // a mouse event `event.clientY`.
    const y = isTouchEvent(event)
      ? /** @type {TouchEvent} */ (event).touches[0]?.clientY
      : /** @type {MouseEvent} */ (event).clientY;
    if (y !== props.y) {
      props.y = y;
    }

    // Check pointer X
    // We either get data from a touch event `event.touches[0].clientX` or from
    // a mouse event `event.clientX`.
    const x = isTouchEvent(event)
      ? /** @type {TouchEvent} */ (event).touches[0]?.clientX
      : /** @type {MouseEvent} */ (event).clientX;
    if (x !== props.x) {
      props.x = x;
    }

    props.changed.x = props.x !== xLast;
    props.changed.y = props.y !== yLast;

    props.last.x = xLast;
    props.last.y = yLast;

    props.delta.x = props.x - xLast;
    props.delta.y = props.y - yLast;

    props.max.x = window.innerWidth;
    props.max.y = window.innerHeight;

    props.progress.x = props.x / props.max.x;
    props.progress.y = props.y / props.max.y;

    return props;
  }

  /**
   * Handle events.
   * @param {MouseEvent|TouchEvent} event The event object.
   */
  function handleEvent(event) {
    // eslint-disable-next-line default-case
    switch (event.type) {
      case 'mouseenter':
      case 'mousemove':
      case 'touchmove':
        trigger(updateProps(event));
        break;
      case 'mousedown':
      case 'touchstart':
        props.isDown = true;
        trigger(props);
        break;
      case 'mouseup':
      case 'touchend':
        props.isDown = false;
        trigger(props);
        break;
    }
  }

  const { add, remove, has, trigger, props } = useService({
    initialProps: {
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
    },
    init() {
      document.documentElement.addEventListener('mouseenter', handleEvent, {
        once: true,
        capture: true,
      });

      const options = { passive: true, capture: true };
      events.forEach((event) => {
        document.addEventListener(event, handleEvent, options);
      });
    },
    kill() {
      events.forEach((event) => {
        document.removeEventListener(event, handleEvent);
      });
    },
  });

  return {
    add,
    remove,
    has,
    props: () => props,
  };
}

let pointer;

/**
 * Use the pointer service.
 *
 * @todo Add element as parameter to get the pointer position relatively from.
 * @returns {PointerService}
 */
export default function usePointer() {
  if (!pointer) {
    pointer = createPointerService();
  }
  return pointer;
}
