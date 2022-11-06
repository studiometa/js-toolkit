/* eslint-disable no-use-before-define, @typescript-eslint/no-use-before-define */
import { useService } from './service.js';
import debounce from '../utils/debounce.js';
import type { ServiceInterface } from './index.js';

export type ScrollService = ServiceInterface<ScrollServiceProps>;

export interface ScrollServiceProps {
  x: number;
  y: number;
  changed: { x: boolean; y: boolean };
  last: { x: number; y: number };
  delta: { x: number; y: number };
  progress: { x: number; y: number };
  max: { x: number; y: number };
  direction: { x: 'LEFT' | 'RIGHT' | 'NONE'; y: 'UP' | 'DOWN' | 'NONE' };
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
    if (window.pageYOffset !== props.y) {
      props.y = window.pageYOffset;
    }

    // Check scroll x
    if (window.pageXOffset !== props.x) {
      props.x = window.pageXOffset;
    }

    props.changed.x = props.x !== xLast;
    props.changed.y = props.y !== yLast;
    props.last.x = xLast;
    props.last.y = yLast;
    props.delta.x = props.x - xLast;
    props.delta.y = props.y - yLast;
    props.max.x = (document.scrollingElement || document.body).scrollWidth - window.innerWidth;
    props.max.y = (document.scrollingElement || document.body).scrollHeight - window.innerHeight;
    props.progress.x = props.max.x === 0 ? 1 : props.x / props.max.x;
    props.progress.y = props.max.y === 0 ? 1 : props.y / props.max.y;
    /* eslint-disable no-nested-ternary */
    props.direction.x = props.x > xLast ? 'RIGHT' : props.x < xLast ? 'LEFT' : 'NONE';
    props.direction.y = props.y > yLast ? 'DOWN' : props.y < yLast ? 'UP' : 'NONE';
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
      x: window.pageXOffset,
      y: window.pageYOffset,
      changed: {
        x: false,
        y: false,
      },
      last: {
        x: window.pageXOffset,
        y: window.pageYOffset,
      },
      delta: {
        x: 0,
        y: 0,
      },
      max: {
        x: (document.scrollingElement || document.body).scrollWidth - window.innerWidth,
        y: (document.scrollingElement || document.body).scrollHeight - window.innerHeight,
      },
      progress: {
        x: 0,
        y: 0,
      },
      direction: {
        x: 'NONE',
        y: 'NONE',
      },
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
