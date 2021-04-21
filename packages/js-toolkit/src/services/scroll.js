import Service from '../abstracts/Service';
import throttle from '../utils/throttle';
import debounce from '../utils/debounce';
import nextFrame from '../utils/nextFrame';

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
    const debounced = debounce(() => {
      this.trigger(this.props);
      nextFrame(() => {
        this.trigger(this.props);
      });
    }, 50);

    this.handler = throttle(() => {
      this.trigger(this.props);

      // Reset changed flags at the end of the scroll event
      debounced();
    }, 32).bind(this);

    // Fire the `scrolled` method on document scroll
    document.addEventListener('scroll', this.handler, { passive: true });
    return this;
  }

  /**
   * Unbind the handler from the scroll event.
   *
   * @return {Scroll}
   */
  kill() {
    document.removeEventListener('scroll', this.handler);
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
