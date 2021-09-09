import Service from './Service.js';
import debounce from '../utils/debounce.js';

/**
 * @typedef {import('./index').ServiceInterface} ServiceInterface
 */

/**
 * @typedef {Object} ScrollServiceProps
 * @property {Number} x
 * @property {Number} y
 * @property {{ x: Boolean, y: Boolean }} changed
 * @property {{ x: Number, y: Number }} last
 * @property {{ x: Number, y: Number }} delta
 * @property {{ x: Number, y: Number }} progress
 * @property {{ x: Number, y: Number }} max
 * @property {{ x: 'LEFT'|'RIGHT'|'NONE', y: 'UP'|'DOWN'|'NONE' }} direction
 */

/**
 * @typedef {Object} ScrollService
 * @property {(key:String, callback:(props:ScrollServiceProps) => void) => void} add
 *   Add a function to the resize service. The key must be uniq.
 * @property {() => ScrollServiceProps} props
 *   Get the current values of the resize service props.
 */

/**
 * Scroll service
 */
class Scroll extends Service {
  /** @type {Number} The y scroll position. */
  y = window.pageYOffset;

  /** @type {Number} The y previous scroll position. */
  yLast = window.pageYOffset;

  /** @type {Number} The x scroll position. */
  x = window.pageXOffset;

  /** @type {Number} The x previous scroll position. */
  xLast = window.pageXOffset;

  /**
   * Bind the handler to the scroll event.
   *
   * @return {Scroll}
   */
  init() {
    document.addEventListener('scroll', this, { passive: true, capture: true });
    return this;
  }

  /**
   * Debounced handler.
   *
   * @return {() => void}
   */
  get debouncedHandler() {
    const debounced = debounce(() => {
      this.trigger(this.props);
    }, 0);

    // Define property to avoid multiple call to the getter
    Object.defineProperty(this, 'debouncedHandler', {
      value: debounced,
    });

    return debounced;
  }

  /**
   * Scroll event handler.
   *
   * @return {void}
   */
  handleEvent() {
    this.trigger(this.props);

    this.debouncedHandler();
  }

  /**
   * Unbind the handler from the scroll event.
   *
   * @return {Scroll}
   */
  kill() {
    document.removeEventListener('scroll', this);
    return this;
  }

  /**
   * Get scroll props.
   *
   * @type {Object}
   */
  get props() {
    this.yLast = this.y;
    this.xLast = this.x;

    // Check scroll Y
    if (window.pageYOffset !== this.y) {
      this.y = window.pageYOffset;
    }

    // Check scroll x
    if (window.pageXOffset !== this.x) {
      this.x = window.pageXOffset;
    }

    return {
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
        x: this.max.x === 0 ? 1 : this.x / this.max.x,
        y: this.max.y === 0 ? 1 : this.y / this.max.y,
      },
      direction: {
        /* eslint-disable no-nested-ternary */
        x: this.x > this.xLast ? 'RIGHT' : this.x < this.xLast ? 'LEFT' : 'NONE',
        y: this.y > this.yLast ? 'DOWN' : this.y < this.yLast ? 'UP' : 'NONE',
        /* eslint-enable no-nested-ternary */
      },
      max: this.max,
    };
  }

  /**
   * Get scroll max values.
   *
   * @type {Object}
   */
  get max() {
    return {
      x: (document.scrollingElement || document.body).scrollWidth - window.innerWidth,
      y: (document.scrollingElement || document.body).scrollHeight - window.innerHeight,
    };
  }
}

let scroll = null;

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
 * @return {ServiceInterface & ScrollService}
 */
export default function useScroll() {
  if (!scroll) {
    scroll = new Scroll();
  }

  const add = scroll.add.bind(scroll);
  const remove = scroll.remove.bind(scroll);
  const has = scroll.has.bind(scroll);
  const props = () => scroll.props;

  return {
    add,
    remove,
    has,
    props,
  };
}
