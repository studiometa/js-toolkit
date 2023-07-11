/* eslint-disable no-use-before-define, @typescript-eslint/no-use-before-define */
import { useService } from './service.js';
import type { ServiceInterface } from './index.js';
import { isDefined } from '../utils/index.js';

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
function createPointerService(target: HTMLElement | undefined): PointerService {
  function getTargetSize() {
    return isDefined(target)
      ? target.getBoundingClientRect()
      : {
          width: window.innerWidth,
          height: window.innerHeight,
          x: 0,
          y: 0,
        };
  }

  /**
   * Update the pointer positions.
   */
  function updateProps(event: MouseEvent | TouchEvent): PointerServiceProps {
    props.event = event;
    const yLast = props.y;
    const xLast = props.x;

    const targetSize = getTargetSize();

    // Check pointer Y
    // We either get data from a touch event `event.touches[0].clientY` or from
    // a mouse event `event.clientY`.
    let y = isTouchEvent(event)
      ? (event as TouchEvent).touches[0]?.clientY
      : (event as MouseEvent).clientY;
    y -= targetSize.y;
    if (y !== props.y) {
      props.y = y;
    }

    // Check pointer X
    // We either get data from a touch event `event.touches[0].clientX` or from
    // a mouse event `event.clientX`.
    let x = isTouchEvent(event)
      ? (event as TouchEvent).touches[0]?.clientX
      : (event as MouseEvent).clientX;
    x -= targetSize.x;
    if (x !== props.x) {
      props.x = x;
    }

    props.changed.x = props.x !== xLast;
    props.changed.y = props.y !== yLast;

    props.last.x = xLast;
    props.last.y = yLast;

    props.delta.x = props.x - xLast;
    props.delta.y = props.y - yLast;

    props.max.x = targetSize.width;
    props.max.y = targetSize.height;

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

  const targetSize = getTargetSize();
  const { add, remove, has, trigger, props } = useService({
    props: {
      event: null,
      isDown: false,
      x: targetSize.x / 2,
      y: targetSize.y / 2,
      changed: {
        x: false,
        y: false,
      },
      last: {
        x: targetSize.x / 2,
        y: targetSize.y / 2,
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
        x: targetSize.width,
        y: targetSize.height,
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

const instances = new Map<HTMLElement | Window, PointerService>();

/**
 * Use the pointer service.
 */
export default function usePointer(target: HTMLElement | undefined): PointerService {
  if (!instances.has(target)) {
    instances.set(target, createPointerService(target));
  }
  return instances.get(target);
}
