/* eslint-disable no-use-before-define */
import { useService } from './useService.js';
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
 * @returns {string}
 */
function getBreakpoint() {
  return window
    .getComputedStyle(getBreakpointElement(), '::before')
    .getPropertyValue('content')
    .replaceAll('"', '');
}

/**
 * Get all breakpoints.
 * @returns {Array}
 */
function getBreakpoints() {
  const breakpoints = window
    .getComputedStyle(getBreakpointElement(), '::after')
    .getPropertyValue('content')
    .replaceAll('"', '');

  return breakpoints.split(',');
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

    if (getBreakpointElement()) {
      props.breakpoint = getBreakpoint();
      props.breakpoints = getBreakpoints();
    } else {
      props.breakpoint = undefined;
      props.breakpoints = undefined;
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
    initialProps: {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.innerWidth / window.innerHeight,
      orientation: 'square',
      breakpoint: getBreakpoint(),
      breakpoints: getBreakpoints(),
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
