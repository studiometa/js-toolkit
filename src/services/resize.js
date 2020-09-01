import Service from '../abstracts/Service';
import debounce from '../utils/debounce';

/**
 * Resize service
 *
 * ```
 * import { useResize } from '@studiometa/js/services';
 * const { add, remove, props } = useResize();
 * add(key, (props) => {});
 * remove(key);
 * props();
 * ```
 */
class Resize extends Service {
  /**
   * Bind the handler to the resize event.
   *
   * @return {void}
   */
  init() {
    this.handler = debounce(() => {
      this.trigger(this.props);
    }).bind(this);

    if (this.canUseResizeObserver) {
      this.resizeObserver = new ResizeObserver(this.handler);
      this.resizeObserver.observe(document.documentElement);
    } else {
      window.addEventListener('resize', this.handler);
    }
  }

  /**
   * Unbind the handler from the resize event.
   *
   * @return {void}
   */
  kill() {
    if (this.canUseResizeObserver) {
      this.resizeObserver.disconnect();
    } else {
      window.removeEventListener('resize', this.handler);
    }
    delete this.resizeObserver;
  }

  /**
   * Get resize props.
   *
   * @type {Object}
   */
  get props() {
    const props = {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.innerWidth / window.innerHeight,
      orientation: 'square',
    };

    if (props.ratio > 1) {
      props.orientation = 'landscape';
    }

    if (props.ratio < 1) {
      props.orientation = 'portrait';
    }

    if (this.breakpointElement) {
      props.breakpoint = this.breakpoint;
      props.breakpoints = this.breakpoints;
    }

    return props;
  }

  /**
   * The element holding the breakpoints data.
   * @return {HTMLElement}
   */
  get breakpointElement() {
    return document.querySelector('[data-breakpoint]') || null;
  }

  /**
   * Get the current breakpoint.
   * @return {String}
   */
  get breakpoint() {
    return window
      .getComputedStyle(this.breakpointElement, '::before')
      .getPropertyValue('content')
      .replace(/"/g, '');
  }

  /**
   * Get all breakpoints.
   * @return {Array}
   */
  get breakpoints() {
    const breakpoints = window
      .getComputedStyle(this.breakpointElement, '::after')
      .getPropertyValue('content')
      .replace(/"/g, '');

    return breakpoints.split(',');
  }

  /**
   * Test if we can use the `ResizeObserver` API.
   * @return {Boolean}
   */
  get canUseResizeObserver() {
    return typeof window.ResizeObserver !== 'undefined';
  }
}

let resize = null;

export default () => {
  if (!resize) {
    resize = new Resize();
  }

  const add = resize.add.bind(resize);
  const remove = resize.remove.bind(resize);
  const has = resize.has.bind(resize);
  const props = () => resize.props;

  return {
    add,
    remove,
    has,
    props,
  };
};
