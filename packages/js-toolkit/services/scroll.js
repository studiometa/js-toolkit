import Service from './Service.js';
import debounce from '../utils/debounce.js';

/**
 * @typedef {import('./index').ServiceInterface<ScrollServiceProps>} ScrollService
 */

/**
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
 * Scroll service
 */
class Scroll extends Service {
  /**
   * Service's props.
   * @type {ScrollServiceProps}
   */
  props = {
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
  };

  /**
   * Bind the handler to the scroll event.
   *
   * @return {Scroll}
   */
  init() {
    this.updateProps();
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
      this.updateProps();
      this.trigger(this.props);
    }, 100);

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
    this.updateProps();
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
   * @returns {ScrollServiceProps}
   */
  updateProps() {
    const yLast = this.props.y;
    const xLast = this.props.x;

    // Check scroll Y
    if (window.pageYOffset !== this.props.y) {
      this.props.y = window.pageYOffset;
    }

    // Check scroll x
    if (window.pageXOffset !== this.props.x) {
      this.props.x = window.pageXOffset;
    }

    this.props.changed.x = this.props.x !== xLast;
    this.props.changed.y = this.props.y !== yLast;
    this.props.last.x = xLast;
    this.props.last.y = yLast;
    this.props.delta.x = this.props.x - xLast;
    this.props.delta.y = this.props.y - yLast;
    this.props.max.x = (document.scrollingElement || document.body).scrollWidth - window.innerWidth;
    this.props.max.y =
      (document.scrollingElement || document.body).scrollHeight - window.innerHeight;
    this.props.progress.x = this.props.max.x === 0 ? 1 : this.props.x / this.props.max.x;
    this.props.progress.y = this.props.max.y === 0 ? 1 : this.props.y / this.props.max.y;
    /* eslint-disable no-nested-ternary */
    this.props.direction.x =
      this.props.x > xLast ? 'RIGHT' : this.props.x < xLast ? 'LEFT' : 'NONE';
    this.props.direction.y = this.props.y > yLast ? 'DOWN' : this.props.y < yLast ? 'UP' : 'NONE';
    /* eslint-enable no-nested-ternary */

    return this.props;
  }
}

/**
 * @type {Scroll}
 */
let instance;

/**
 * @type {ScrollService}
 */
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
 * @return {ScrollService}
 */
export default function useScroll() {
  if (!scroll) {
    if (!instance) {
      instance = new Scroll();
    }

    scroll = {
      add: instance.add.bind(instance),
      remove: instance.remove.bind(instance),
      has: instance.has.bind(instance),
      props: instance.updateProps.bind(instance),
    };
  }

  return scroll;
}
