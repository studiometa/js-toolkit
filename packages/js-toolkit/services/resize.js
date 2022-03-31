import Service from './Service.js';
import debounce from '../utils/debounce.js';

/**
 * @typedef {import('./index').ServiceInterface<ResizeServiceProps>} ResizeService
 */

/**
 * @typedef {Object} ResizeServiceProps
 * @property {number} width
 * @property {number} height
 * @property {number} ratio
 * @property {'square'|'landscape'|'portrait'} orientation
 * @property {string} [breakpoint]
 * @property {string[]} [breakpoints]
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
   * @returns {this}
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
   * @returns {void}
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
    } else {
      this.props.breakpoint = undefined;
      this.props.breakpoints = undefined;
    }

    return this.props;
  }

  /**
   * The element holding the breakpoints data.
   * @returns {HTMLElement}
   */
  get breakpointElement() {
    return document.querySelector('[data-breakpoint]');
  }

  /**
   * Get the current breakpoint.
   * @returns {string}
   */
  get breakpoint() {
    return window
      .getComputedStyle(this.breakpointElement, '::before')
      .getPropertyValue('content')
      .replaceAll('"', '');
  }

  /**
   * Get all breakpoints.
   * @returns {Array}
   */
  get breakpoints() {
    const breakpoints = window
      .getComputedStyle(this.breakpointElement, '::after')
      .getPropertyValue('content')
      .replaceAll('"', '');

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
 * @returns {ResizeService}
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
