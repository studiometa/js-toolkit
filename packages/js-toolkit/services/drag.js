/* eslint-disable no-use-before-define */
import { useService } from './service.js';
import useRaf from './raf.js';
import inertiaFinalValue from '../utils/math/inertiaFinalValue.js';
import { isDefined } from '../utils/index.js';

/**
 * @typedef {import('./index').ServiceInterface<DragServiceProps>} DragService
 * @typedef {import('./pointer.js').PointerServiceProps} PointerServiceProps
 * @typedef {'start'|'drag'|'drop'|'inertia'|'stop'} DragLifecycle
 * @typedef {Object} DragServiceProps
 * @property {DragLifecycle} mode
 *   The current mode of the dragging logic.
 * @property {HTMLElement} target
 *   The target element of the drag.
 * @property {boolean} isGrabbing
 *   Whether the user is currently grabbing the targeted element or not.
 * @property {boolean} hasInertia
 *   Whether the drag currently has inertia or not.
 * @property {number} x
 *   The current horizontal position in the viewport.
 * @property {number} y
 *   The current vertical position in the viewport.
 * @property {{ x: number, y: number }} delta
 *   The delta between the current position and the last.
 * @property {{ x: number, y: number }} origin
 *   The initial position where the dragging started.
 * @property {{ x: number, y: number }} distance
 *   The distance from the current position to the origin.
 * @property {{ x: number, y: number }} final
 *   The final position that will be reached at the end of the inertia.
 * @typedef {Object} DragServiceOptions
 * @property {number} [dampFactor]
 * @property {number} [dragTreshold]
 */

/**
 * @type {Record<Uppercase<DragLifecycle>, DragLifecycle>}
 */
const MODES = {
  START: 'start',
  DRAG: 'drag',
  DROP: 'drop',
  INERTIA: 'inertia',
  STOP: 'stop',
};

let count = 0;
const events = ['pointerdown', 'pointerup'];
const passiveEventOptions = { passive: true };

/**
 * Get the client value for the given axis.
 * @param   {MouseEvent|TouchEvent} event
 * @returns {{ x: number, y: number }}
 */
function getEventPosition(event) {
  // @ts-ignore
  const eventOrTouch = isDefined(event.touches) ? event.touches[0] : event;
  return {
    x: eventOrTouch.clientX,
    y: eventOrTouch.clientY,
  };
}

/**
 * Get drag service.
 * @param   {HTMLElement} target
 * @param   {Object} [options]
 * @param   {number} [options.dampFactor]
 * @param   {number} [options.dragTreshold]
 * @returns {DragService}
 */
function createDragService(target, { dampFactor = 0.85, dragTreshold = 10 } = {}) {
  count += 1;
  const id = `drag-${count}`;
  let previousEvent;

  /**
   * Test if we should allow click on links and buttons.
   *
   * @private
   * @returns {boolean}
   */
  function shouldPreventClick() {
    return Math.abs(props.distance.x) > dragTreshold || Math.abs(props.distance.y) > dragTreshold;
  }

  /**
   * Start the drag.
   * @param {number} x The initial horizontal position.
   * @param {number} y The initial vertical position.
   * @returns {void}
   */
  function start(x, y) {
    if (props.isGrabbing) {
      return;
    }

    // Reset state
    props.x = x;
    props.y = y;
    props.origin.x = x;
    props.origin.y = y;
    props.delta.x = 0;
    props.delta.y = 0;
    props.distance.x = 0;
    props.distance.y = 0;
    props.final.x = x;
    props.final.y = y;

    props.mode = MODES.START;

    // Enable grabbing
    props.isGrabbing = true;

    trigger(props);

    document.addEventListener('touchmove', handleEvent, passiveEventOptions);
    document.addEventListener('mousemove', handleEvent, passiveEventOptions);
  }

  /**
   * Stop the drag, or drop.
   * @returns {void}
   */
  function drop() {
    document.removeEventListener('touchmove', handleEvent);
    document.removeEventListener('mousemove', handleEvent);
    props.isGrabbing = false;
    props.mode = MODES.DROP;

    props.hasInertia = true;
    props.final.x = inertiaFinalValue(props.x, props.delta.x, dampFactor);
    props.final.y = inertiaFinalValue(props.y, props.delta.y, dampFactor);

    trigger(props);

    setTimeout(() => {
      const raf = useRaf();
      raf.remove(id);
      raf.add(id, rafHandler);
    }, 0);
  }

  /**
   * Stop the drag.
   */
  function stop() {
    useRaf().remove(id);
    props.isGrabbing = false;
    props.hasInertia = false;
    props.mode = MODES.STOP;
    trigger(props);
  }

  /**
   * Raf service handler.
   * @returns {void}
   */
  function rafHandler() {
    if (!props.isGrabbing) {
      props.x += props.delta.x;
      props.y += props.delta.y;
      props.distance.x = props.x - props.origin.x;
      props.distance.y = props.y - props.origin.y;

      props.delta.x *= dampFactor;
      props.delta.y *= dampFactor;

      if (props.mode !== MODES.INERTIA) {
        props.mode = MODES.INERTIA;
      }

      trigger(props);

      if (Math.abs(props.delta.x) < 0.1 && Math.abs(props.delta.y) < 0.1) {
        stop();
      }
    }
  }

  /**
   * Pointer service handler.
   * @param {TouchEvent|MouseEvent} event
   * @returns {void}
   */
  function drag(event) {
    if (props.isGrabbing) {
      const position = getEventPosition(event);
      props.x = position.x;
      props.y = position.y;

      if (previousEvent) {
        const previousPosition = getEventPosition(previousEvent);
        props.delta.x = position.x - previousPosition.x;
        props.delta.y = position.y - previousPosition.y;
      }

      props.final.x = position.x;
      props.final.y = position.y;
      props.distance.x = props.x - props.origin.x;
      props.distance.y = props.y - props.origin.y;

      if (props.mode !== MODES.DRAG) {
        props.mode = MODES.DRAG;
      }

      trigger(props);
      previousEvent = event;
    }
  }

  /**
   * Handle any event.
   * @param {MouseEvent|PointerEvent|DragEvent} event
   */
  function handleEvent(event) {
    switch (event.type) {
      case 'dragstart':
        event.preventDefault();
        break;
      case 'click':
        if (shouldPreventClick()) {
          event.stopImmediatePropagation();
          event.stopPropagation();
          event.preventDefault();
        }
        break;
      case 'pointerup':
        drop();
        break;
      case 'touchmove':
      case 'mousemove':
        drag(event);
        break;
      default:
        if (event.button === 0) {
          start(event.x, event.y);
        }
    }
  }

  const { add, remove, has, trigger, props } = useService({
    /**
     * @type {DragServiceProps}
     */
    props: {
      target,
      mode: undefined,
      isGrabbing: false,
      hasInertia: false,
      x: 0,
      y: 0,
      delta: {
        x: 0,
        y: 0,
      },
      origin: {
        x: 0,
        y: 0,
      },
      distance: {
        x: 0,
        y: 0,
      },
      final: {
        x: 0,
        y: 0,
      },
    },
    init() {
      events.forEach((event) => {
        target.addEventListener(event, handleEvent, passiveEventOptions);
      });
      target.addEventListener('dragstart', handleEvent, { capture: true });
      target.addEventListener('click', handleEvent, { capture: true });
    },
    kill() {
      events.forEach((event) => {
        target.removeEventListener(event, handleEvent);
      });
      target.removeEventListener('dragstart', handleEvent);
      target.removeEventListener('click', handleEvent);
    },
  });

  return {
    add,
    remove,
    has,
    props: () => props,
  };
}

/**
 * @type {WeakMap<HTMLElement, DragService | undefined>}
 */
const instances = new WeakMap();

/**
 * Use the drag service.
 *
 * ```js
 * import { useDrag } from '@studiometa/js-toolkit/services';
 * const { add, remove, props } = useDrag();
 * const draggableElement = document.querySelector('.draggable');
 * add(draggableElement, (props) => {}, { factor: 0.8 });
 * remove(draggableElement);
 * props(draggableElement);
 * ```
 *
 * @param {HTMLElement} target
 * @param {DragServiceOptions} options
 * @returns {DragService}
 */
export default function useDrag(target, options) {
  if (!instances.has(target)) {
    instances.set(target, createDragService(target, options));
  }

  return instances.get(target);
}
