/* eslint-disable no-use-before-define, @typescript-eslint/no-use-before-define */
import { useService } from './service.js';
import debounce from '../utils/debounce.js';
import type { ServiceInterface } from './index.js';

export type ScrollService = ServiceInterface<ScrollServiceProps>;

export interface ScrollServiceProps {
  x: number;
  y: number;
  changed: { x: boolean; y: boolean };
  changedX: boolean;
  changedY: boolean;
  last: { x: number; y: number };
  lastX: number;
  lastY: number;
  delta: { x: number; y: number };
  deltaX: number;
  deltaY: number;
  progress: { x: number; y: number };
  progressX: number;
  progressY: number;
  max: { x: number; y: number };
  maxX: number;
  maxY: number;
  direction: { x: 'LEFT' | 'RIGHT' | 'NONE'; y: 'UP' | 'DOWN' | 'NONE' };
  isUp: boolean;
  isRight: boolean;
  isDown: boolean;
  isLeft: boolean;
}

/**
 * Create scroll service.
 */
function createScrollService(): ScrollService {
  /**
   * Update props.
   */
  function updateProps(): ScrollServiceProps {
    const yLast = props.y;
    const xLast = props.x;

    // Check scroll Y
    if (window.scrollY !== props.y) {
      props.y = window.scrollY;
    }

    // Check scroll x
    if (window.scrollX !== props.x) {
      props.x = window.scrollX;
    }

    props.changed.x = props.changedX = props.x !== xLast;
    props.changed.y = props.changedY = props.y !== yLast;
    props.last.x = props.lastX = xLast;
    props.last.y = props.lastY = yLast;
    props.delta.x = props.deltaX = props.x - xLast;
    props.delta.y = props.deltaY = props.y - yLast;
    props.max.x = props.maxX = (document.scrollingElement || document.body).scrollWidth - window.innerWidth;
    props.max.y = props.maxY = (document.scrollingElement || document.body).scrollHeight - window.innerHeight;
    props.progress.x = props.progressX = props.max.x === 0 ? 1 : props.x / props.max.x;
    props.progress.y = props.progressY = props.max.y === 0 ? 1 : props.y / props.max.y;
    props.isUp = props.y < yLast;
    props.isRight = props.x > xLast;
    props.isDown = props.y > yLast;
    props.isLeft = props.x < xLast;
    /* eslint-disable no-nested-ternary */
    props.direction.x = props.isRight ? 'RIGHT' : props.isLeft ? 'LEFT' : 'NONE';
    props.direction.y = props.isDown ? 'DOWN' : props.isUp ? 'UP' : 'NONE';
    /* eslint-enable no-nested-ternary */

    return props;
  }

  const onScrollDebounced = debounce(() => {
    trigger(updateProps());
  }, 100);

  /**
   * Scroll handler.
   */
  function onScroll() {
    trigger(updateProps());
    onScrollDebounced();
  }

  const { add, remove, has, props, trigger } = useService({
    props: {
      x: window.scrollX,
      y: window.scrollY,
      changed: {
        x: false,
        y: false,
      },
      changedX: false,
      changedY: false,
      last: {
        x: window.scrollX,
        y: window.scrollY,
      },
      lastX: window.scrollX,
      lastY: window.scrollY,
      delta: {
        x: 0,
        y: 0,
      },
      deltaX: 0,
      deltaY: 0,
      max: {
        x: (document.scrollingElement || document.body).scrollWidth - window.innerWidth,
        y: (document.scrollingElement || document.body).scrollHeight - window.innerHeight,
      },
      maxX: (document.scrollingElement || document.body).scrollWidth - window.innerWidth,
      maxY: (document.scrollingElement || document.body).scrollHeight - window.innerHeight,
      progress: {
        x: 0,
        y: 0,
      },
      progressX: 0,
      progressY: 0,
      direction: {
        x: 'NONE',
        y: 'NONE',
      },
      isUp: false,
      isRight: false,
      isDown: false,
      isLeft: false,
    } as ScrollServiceProps,
    init() {
      document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    },
    kill() {
      document.removeEventListener('scroll', onScroll);
    },
  });

  return {
    add,
    remove,
    has,
    props: () => props,
  };
}

let scroll;

/**
 * Use the scroll service.
 *
 * ```js
 * import { useScroll } from '@studiometa/js-toolkit/services';
 * const { add, remove, props } = useScroll();
 * add(key, (props) => {});
 * remove(key);
 * props();
 * ```
 */
export default function useScroll(): ScrollService {
  if (!scroll) {
    scroll = createScrollService();
  }

  return scroll;
}
