/* eslint-disable no-use-before-define */
import { useService } from './service.js';
import debounce from '../utils/debounce.js';

/**
 * @typedef {import('./index').ServiceInterface<ScrollServiceProps>} ScrollService
 * @typedef {Object} ScrollServiceProps
 * @property {number} x
 * @property {number} y
 * @property {{ x: boolean, y: boolean }} changed
 * @property {{ x: number, y: number }} last
 * @property {{ x: number, y: number }} delta
 * @property {{ x: number, y: number }} progress
 * @property {{ x: number, y: number }} max
 * @property {{ x: 'LEFT'|'RIGHT'|'NONE', y: 'UP'|'DOWN'|'NONE' }} direction
 */

/**
 * Create scroll service.
 * @returns {ScrollService}
 */
function createScrollService() {
  /**
   * Update props.
   * @returns {ScrollServiceProps}
   */
  function updateProps() {
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
   * @returns {void}
   */
  function onScroll() {
    trigger(updateProps());
    onScrollDebounced();
  }

  const { add, remove, has, props, trigger } = useService({
    /**
     * @type {ScrollServiceProps}
     */
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
    },
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
 *
 * @returns {ScrollService}
 */
export default function useScroll() {
  if (!scroll) {
    scroll = createScrollService();
  }

  return scroll;
}
