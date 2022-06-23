/* eslint-disable no-use-before-define */
import { useService } from './service.js';
import debounce from '../utils/debounce.js';

/**
 * @typedef {import('./index').ServiceInterface<ResizeServiceProps>} ResizeService
 * @typedef {Object} ResizeServiceProps
 * @property {number} width
 * @property {number} height
 * @property {number} ratio
 * @property {'square'|'landscape'|'portrait'} orientation
 * @property {string} [breakpoint]
 * @property {string[]} [breakpoints]
 */

let breakpointElement;
let breakpoints = [];

/**
 * The element holding the breakpoints data.
 * @returns {HTMLElement}
 */
function getBreakpointElement() {
  if (!breakpointElement) {
    breakpointElement = document.querySelector('[data-breakpoint]');
  }
  return breakpointElement;
}

/**
 * Get the current breakpoint.
 * @returns {string|null}
 */
function getBreakpoint() {
  return getBreakpointElement()
    ? window
        .getComputedStyle(getBreakpointElement(), '::before')
        .getPropertyValue('content')
        .replaceAll('"', '')
    : undefined;
}

/**
 * Get all breakpoints.
 * @returns {string[]}
 */
function getBreakpoints() {
  if (!getBreakpointElement() || breakpoints.length) {
    return breakpoints;
  }
  breakpoints = window
    .getComputedStyle(getBreakpointElement(), '::after')
    .getPropertyValue('content')
    .replaceAll('"', '')
    .split(',');

  return breakpoints;
}

/**
 * Get resize service.
 * @returns {ResizeService}
 */
function createResizeService() {
  /**
   * Update props.
   * @returns {ResizeServiceProps}
   */
  function updateProps() {
    props.width = window.innerWidth;
    props.height = window.innerHeight;
    props.ratio = window.innerWidth / window.innerHeight;
    props.orientation = 'square';

    if (props.ratio > 1) {
      props.orientation = 'landscape';
    }

    if (props.ratio < 1) {
      props.orientation = 'portrait';
    }

    return props;
  }

  const onResize = debounce(() => {
    trigger(updateProps());
  });

  const { add, remove, has, trigger, props } = useService({
    /**
     * @type {ResizeServiceProps}
     */
    props: {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.innerWidth / window.innerHeight,
      orientation: 'square',
      get breakpoint() {
        return getBreakpoint();
      },
      get breakpoints() {
        return getBreakpoints();
      },
    },
    init() {
      window.addEventListener('resize', onResize);
    },
    kill() {
      window.removeEventListener('resize', onResize);
    },
  });

  return {
    add,
    remove,
    has,
    props: () => props,
  };
}

let resize;

/**
 * Use the resize service.
 *
 * @returns {ResizeService}
 */
export default function useResize() {
  if (!resize) {
    resize = createResizeService();
  }

  return resize;
}
