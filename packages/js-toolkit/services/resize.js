import Service from '../abstracts/Service.js';
import debounce from '../utils/debounce.js';

/**
 * @typedef {import('./index').ServiceInterface} ServiceInterface
 */

/**
 * @typedef {Object} ResizeServiceProps
 * @property {Number} width
 * @property {Number} height
 * @property {Number} ratio
 * @property {'square'|'landscape'|'portrait'} orientation
 * @property {String} [breakpoint]
 * @property {String[]} [breakpoints]
 */

/**
 * @typedef {Object} ResizeService
 * @property {(key:String, callback:(props:ResizeServiceProps) => void) => void} add
 *   Add a function to the resize service. The key must be uniq.
 * @property {() => ResizeServiceProps} props
 *   Get the current values of the resize service props.
 */

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
   * @return {this}
   */
  init() {
    this.handler = debounce(() => {
      this.trigger(this.props);
    }).bind(this);

    if (this.canUseResizeObserver) {
      // @ts-ignore
      this.resizeObserver = new ResizeObserver(this.handler);
      this.resizeObserver.observe(document.documentElement);
    } else {
      window.addEventListener('resize', this.handler);
    }

    return this;
  }

  /**
   * Unbind the handler from the resize event.
   *
   * @return {this}
   */
  kill() {
    if (this.canUseResizeObserver) {
      this.resizeObserver.disconnect();
    } else {
      window.removeEventListener('resize', this.handler);
    }
    delete this.resizeObserver;

    return this;
  }

  /**
   * Get resize props.
   *
   * @type {ResizeServiceProps}
   */
  get props() {
    /** @type {ResizeServiceProps} [description] */
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
    // @ts-ignore
    return typeof window.ResizeObserver !== 'undefined';
  }
}

let resize = null;

/**
 * Use the resize service.
 *
 * ```js
 * import useResize from '@studiometa/js-toolkit/services/resize';
 * const { add, remove, props } = useResize();
 * add(key, (props) => {});
 * remove(key);
 * props();
 * ```
 * @return {ServiceInterface & ResizeService}
 */
export default function useResize() {
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
}
