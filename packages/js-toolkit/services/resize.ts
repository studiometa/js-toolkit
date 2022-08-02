/* eslint-disable no-use-before-define, @typescript-eslint/no-use-before-define */
import { useService } from './service.js';
import debounce from '../utils/debounce.js';
import type { ResizeServiceInterface } from './index.js';

export interface ResizeServiceProps<U extends Record<string, string>> {
  width: number;
  height: number;
  ratio: number;
  orientation: 'square' | 'landscape' | 'portrait';
  breakpoint?: string;
  breakpoints?: string[];
  activeBreakpoints?: Record<keyof U, boolean>;
}

/**
 * Get resize service.
 */
function createResizeService<T extends Record<string, string>>(
  screens: Partial<T> = {},
): ResizeServiceInterface<T> {
  /**
   * Update props.
   */
  function updateProps(): ResizeServiceProps<T> {
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
        return Object.keys(this.activeBreakpoints).find((name) => this.activeBreakpoints[name]);
      },
      get breakpoints() {
        return Object.keys(this.activeBreakpoints);
      },
      get activeBreakpoints() {
        return Object.fromEntries(
          Object.entries(screens).map(([name, breakpoint]) => [
            name,
            window.matchMedia(`(min-width: ${breakpoint})`).matches,
          ]),
        ) as Record<keyof T, boolean>;
      },
    } as ResizeServiceProps<T>,
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
export default function useResize<T extends Record<string, string>>(
  screens: Partial<T> = {},
): ResizeServiceInterface<T> {
  if (!resize) {
    resize = createResizeService(screens);
  }

  return resize;
}
