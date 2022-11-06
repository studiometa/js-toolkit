/* eslint-disable no-use-before-define, @typescript-eslint/no-use-before-define */
import { useService } from './service.js';
import debounce from '../utils/debounce.js';
import type { ServiceInterface } from './index.js';

export type ResizeService = ServiceInterface<ResizeServiceProps>;

export interface ResizeServiceProps {
  width: number;
  height: number;
  ratio: number;
  orientation: 'square' | 'landscape' | 'portrait';
  breakpoint?: string;
  breakpoints?: string[];
}

let breakpointElement;
let breakpoints = [];

/**
 * The element holding the breakpoints data.
 */
function getBreakpointElement(): HTMLElement {
  if (!breakpointElement) {
    breakpointElement = document.querySelector('[data-breakpoint]');
  }
  return breakpointElement;
}

/**
 * Get the current breakpoint.
 */
function getBreakpoint(): string | null {
  return getBreakpointElement()
    ? window
        .getComputedStyle(getBreakpointElement(), '::before')
        .getPropertyValue('content')
        .replaceAll('"', '')
    : undefined;
}

/**
 * Get all breakpoints.
 */
function getBreakpoints(): string[] {
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
 */
function createResizeService(): ResizeService {
  /**
   * Update props.
   */
  function updateProps(): ResizeServiceProps {
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
    } as ResizeServiceProps,
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
 */
export default function useResize(): ResizeService {
  if (!resize) {
    resize = createResizeService();
  }

  return resize;
}
