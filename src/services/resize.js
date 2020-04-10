import { Service } from '../abstracts';
import { debounce } from '../utils';

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
  /** @type {HTMLElement} The element holding the breakpoints data. */
  breakpointElement = null;

  /**
   * Bind the handler to the resize event.
   *
   * @return {void}
   */
  init() {
    this.handler = debounce(() => {
      this.trigger(this.props);
    }).bind(this);
    window.addEventListener('resize', this.handler);

    this.breakpointElement = document.querySelector('[data-breakpoint]') || null;
  }

  /**
   * Unbind the handler from the resize event.
   *
   * @return {void}
   */
  kill() {
    window.removeEventListener('resize', this.handler);
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
   * Get the current breakpoint.
   * @return {String}
   */
  get breakpoint() {
    return (
      window
        .getComputedStyle(this.breakpointElement, '::before')
        .getPropertyValue('content')
        .replace(/"/g, '') || ''
    );
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
}

const resize = new Resize();
const add = resize.add.bind(resize);
const remove = resize.remove.bind(resize);
const props = () => resize.props;

export default () => ({
  add,
  remove,
  props,
});
