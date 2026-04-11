import type { ServiceConfig, ServiceInterface } from './AbstractService.js';
import { AbstractService } from './AbstractService.js';
import { debounce } from '../utils/debounce.js';
import { PASSIVE_CAPTURE_EVENT_OPTIONS } from './utils.js';
import { nextTick } from '../utils/nextTick.js';

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

export type ScrollServiceInterface = ServiceInterface<ScrollServiceProps>;

export class ScrollService extends AbstractService<ScrollServiceProps> {
  static config: ServiceConfig = [
    [() => document, [['scroll', PASSIVE_CAPTURE_EVENT_OPTIONS]]],
    [() => window, [['resize', PASSIVE_CAPTURE_EVENT_OPTIONS]]],
  ];

  /**
   * Cached scroll max values, updated on resize and first scroll.
   * @private
   */
  __maxX: number | null = null;
  __maxY: number | null = null;

  /**
   * Observe scroll container size changes that do not trigger window resize.
   * @private
   */
  __resizeObserver: ResizeObserver | null = null;

  props: ScrollServiceProps = {
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
      x: document.scrollingElement.scrollWidth - window.innerWidth,
      y: document.scrollingElement.scrollHeight - window.innerHeight,
    },
    maxX: document.scrollingElement.scrollWidth - window.innerWidth,
    maxY: document.scrollingElement.scrollHeight - window.innerHeight,
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
  };

  updateProps(): ScrollServiceProps {
    const { props } = this;
    const yLast = props.y;
    const xLast = props.x;

    props.y = window.scrollY;
    props.x = window.scrollX;
    props.changed.x = props.changedX = props.x !== xLast;
    props.changed.y = props.changedY = props.y !== yLast;
    props.last.x = props.lastX = xLast;
    props.last.y = props.lastY = yLast;
    props.delta.x = props.deltaX = props.x - xLast;
    props.delta.y = props.deltaY = props.y - yLast;
    if (this.__maxX === null || this.__maxY === null) {
      this.__updateMaxValues();
    }
    props.max.x = props.maxX = this.__maxX;
    props.max.y = props.maxY = this.__maxY;
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

  update(trigger = true) {
    nextTick(() => this.updateProps()).then(() => {
      if (trigger) {
        this.trigger(this.props);
      }
    });
  }

  onScrollDebounced = debounce(() => {
    this.update();
  }, 100);

  /**
   * Update cached max scroll values on resize.
   * @private
   */
  __updateMaxValues() {
    this.__maxX = document.scrollingElement.scrollWidth - window.innerWidth;
    this.__maxY = document.scrollingElement.scrollHeight - window.innerHeight;
  }

  /**
   * Scroll and resize handler.
   */
  handleEvent(event: Event) {
    if (event.type === 'resize') {
      this.__updateMaxValues();
      this.update(false);
      return;
    }

    this.update();
    this.onScrollDebounced();
  }

  init() {
    super.init();

    if (typeof ResizeObserver === 'function' && document.scrollingElement) {
      this.__resizeObserver = new ResizeObserver(() => {
        this.__updateMaxValues();
      });
      this.__resizeObserver.observe(document.scrollingElement);
    }
  }

  kill() {
    this.__resizeObserver?.disconnect();
    this.__resizeObserver = null;
    super.kill();
  }
}

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
 * @link https://js-toolkit.studiometa.dev/api/services/useScroll.html
*/
export function useScroll(): ScrollServiceInterface {
  return ScrollService.getInstance();
}
