import Service from '../abstracts/Service';
import { throttle, debounce } from '../utils';

/**
 * Scroll service
 *
 * ```
 * import { useScroll } from '@studiometa/js-toolkit/services';
 * const { add, remove, props } = useScroll();
 * add(key, (props) => {});
 * remove(key);
 * props();
 * ```
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
   * @return {void}
   */
  init() {
    const debounced = debounce(() => {
      this.trigger(this.props);
      requestAnimationFrame(() => {
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
  }

  /**
   * Unbind the handler from the scroll event.
   *
   * @return {void}
   */
  kill() {
    document.removeEventListener('scroll', this.handler);
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
      this.yProgress = this.y / this.max.y;
    }

    // Check scroll x
    if (window.pageXOffset !== this.x) {
      this.x = window.pageXOffset;
      this.xProgress = this.x / this.max.x;
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
        x: this.xProgress,
        y: this.yProgress,
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

export default () => {
  if (!scroll) {
    scroll = new Scroll();
  }

  const add = scroll.add.bind(scroll);
  const remove = scroll.remove.bind(scroll);
  const props = () => scroll.props;

  return {
    add,
    remove,
    props,
  };
};
