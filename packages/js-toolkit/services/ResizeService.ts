import type { ServiceConfig, ServiceInterface } from './AbstractService.js';
import { AbstractService } from './AbstractService.js';
import type { Features } from '../Base/features.js';
import { features } from '../Base/features.js';
import { debounce } from '../utils/debounce.js';
import { cache } from '../utils/cache.js';

export interface ResizeServiceProps<U extends Features['breakpoints'] = Features['breakpoints']> {
  width: number;
  height: number;
  ratio: number;
  orientation: 'square' | 'landscape' | 'portrait';
  breakpoint: keyof U;
  breakpoints: Array<keyof U>;
  activeBreakpoints: Record<keyof U, boolean>;
}

export type ResizeServiceInterface<U extends Features['breakpoints'] = Features['breakpoints']> =
  ServiceInterface<ResizeServiceProps<U>>;

export class ResizeService<
  T extends Features['breakpoints'] = Features['breakpoints'],
> extends AbstractService<ResizeServiceProps<T>> {
  static config: ServiceConfig = [[() => window, [['resize']]]];

  breakpoints: T;

  props: ResizeServiceProps<T> = {
    width: window.innerWidth,
    height: window.innerHeight,
    ratio: window.innerWidth / window.innerHeight,
    orientation: 'square',
    get breakpoint() {
      return Object.keys(this.activeBreakpoints)
        .toReversed()
        .find((name) => this.activeBreakpoints[name]);
    },
    get breakpoints() {
      return Object.keys(this.activeBreakpoints);
    },
    activeBreakpoints: {} as Record<keyof T, boolean>,
  };

  constructor(breakpoints: T) {
    super();
    this.breakpoints = breakpoints;

    Object.defineProperty(this.props, 'activeBreakpoints', {
      get: () => {
        const activeBreakpoints = {};

        for (const [name, breakpoint] of Object.entries(
          this.breakpoints ?? features.get('breakpoints'),
        )) {
          activeBreakpoints[name] = cache(
            [this, window.innerWidth, window.innerHeight, breakpoint],
            () => window.matchMedia(`(min-width: ${breakpoint})`).matches,
          );
        }

        return activeBreakpoints as Record<keyof T, boolean>;
      },
    });
  }

  /**
   * Update props.
   */
  updateProps(): ResizeServiceProps<T> {
    const { props } = this;

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

  onResizeDebounce = debounce(() => {
    this.trigger(this.updateProps());
  }, 100);

  handleEvent() {
    this.onResizeDebounce();
  }
}

/**
 * Use the resize service.
 * @link https://js-toolkit.studiometa.dev/api/services/useResize.html
*/
export function useResize<T extends Features['breakpoints'] = Features['breakpoints']>(
  breakpoints?: T,
): ResizeServiceInterface<T> {
  return ResizeService.getInstance([breakpoints], breakpoints);
}
