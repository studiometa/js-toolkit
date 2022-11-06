/* eslint-disable no-use-before-define, @typescript-eslint/no-use-before-define */
import { useService } from './service.js';
import type { ServiceInterface } from './index.js';

export type PointerService = ServiceInterface<PointerServiceProps>;

export interface PointerServiceProps {
  event: MouseEvent | TouchEvent;
  isDown: boolean;
  x: number;
  y: number;
  changed: { x: boolean; y: boolean };
  last: { x: number; y: number };
  delta: { x: number; y: number };
  progress: { x: number; y: number };
  max: { x: number; y: number };
}

/**
 * Test if an event is an instance of TouchEvent.
 */
function isTouchEvent(event: TouchEvent | MouseEvent): boolean {
  return typeof TouchEvent !== 'undefined' && event instanceof TouchEvent;
}

const events = ['mousemove', 'touchmove', 'mousedown', 'touchstart', 'mouseup', 'touchend'];

/**
 * Get pointer service.
 */
function createPointerService(): PointerService {
  /**
   * Update the pointer positions.
   */
  function updateProps(event: MouseEvent | TouchEvent): PointerServiceProps {
    props.event = event;
    const yLast = props.y;
    const xLast = props.x;

    // Check pointer Y
    // We either get data from a touch event `event.touches[0].clientY` or from
    // a mouse event `event.clientY`.
    const y = isTouchEvent(event)
      ? (event as TouchEvent).touches[0]?.clientY
      : (event as MouseEvent).clientY;
    if (y !== props.y) {
      props.y = y;
    }

    // Check pointer X
    // We either get data from a touch event `event.touches[0].clientX` or from
    // a mouse event `event.clientX`.
    const x = isTouchEvent(event)
      ? (event as TouchEvent).touches[0]?.clientX
      : (event as MouseEvent).clientX;
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
   */
  function handleEvent(event: MouseEvent | TouchEvent) {
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
    props: {
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
    } as PointerServiceProps,
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
 */
export default function usePointer(): PointerService {
  if (!pointer) {
    pointer = createPointerService();
  }
  return pointer;
}
