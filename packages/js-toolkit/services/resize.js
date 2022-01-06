import Service from './Service.js';
import debounce from '../utils/debounce.js';

/**
 * @typedef {import('./index').ServiceInterface<ResizeServiceProps>} ResizeService
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
   * Props.
   * @type {ResizeServiceProps}
   */
  props = {
    width: window.innerWidth,
    height: window.innerHeight,
    ratio: window.innerWidth / window.innerHeight,
    orientation: 'square',
  };

  /**
   * @type {() => void}
   */
  handler;

  /**
   * Bind the handler to the resize event.
   *
   * @return {this}
   */
  init() {
    this.handler = debounce(() => {
      this.updateProps();
      this.trigger(this.props);
    }).bind(this);

    window.addEventListener('resize', this.handler);

    return this;
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
   * @returns {ResizeServiceProps}
   */
  updateProps() {
    this.props.width = window.innerWidth;
    this.props.height = window.innerHeight;
    this.props.ratio = window.innerWidth / window.innerHeight;
    this.props.orientation = 'square';

    if (this.props.ratio > 1) {
      this.props.orientation = 'landscape';
    }

    if (this.props.ratio < 1) {
      this.props.orientation = 'portrait';
    }

    if (this.breakpointElement) {
      this.props.breakpoint = this.breakpoint;
      this.props.breakpoints = this.breakpoints;
    }

    return this.props;
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
}

/**
 * @type {Resize}
 */
let instance;

/**
 * @type {ResizeService}
 */
let resize;

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
 * @return {ResizeService}
 */
export default function useResize() {
  if (!resize) {
    if (!instance) {
      instance = new Resize();
    }

    const add = instance.add.bind(instance);
    const remove = instance.remove.bind(instance);
    const has = instance.has.bind(instance);
    const props = instance.updateProps.bind(instance);

    resize = {
      add,
      remove,
      has,
      props,
    };
  }

  return resize;
}
