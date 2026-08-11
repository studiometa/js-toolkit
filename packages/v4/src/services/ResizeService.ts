import { createService, type Service } from './Service.js';

export type ResizeOrientation = 'square' | 'landscape' | 'portrait';

/**
 * Named viewport widths, ascending. Values are the ones v3 ships, in `rem`
 * so they follow the root font size.
 */
export const BREAKPOINTS: Record<string, string> = {
  xxs: '0rem',
  xs: '30rem',
  s: '48rem',
  m: '64rem',
  l: '80rem',
  xl: '90rem',
  xxl: '120rem',
  xxxl: '160rem',
};

export interface ResizeProps {
  width: number;
  height: number;
  ratio: number;
  orientation: ResizeOrientation;
  /** Name of the widest breakpoint the viewport currently matches. */
  breakpoint: string;
}

function orientationFor(ratio: number): ResizeOrientation {
  if (ratio > 1) return 'landscape';
  if (ratio < 1) return 'portrait';
  return 'square';
}

/**
 * The widest matching name. `BREAKPOINTS` is ascending, so the last match
 * wins.
 */
function currentBreakpoint(): string {
  let match = '';
  for (const [name, value] of Object.entries(BREAKPOINTS)) {
    if (window.matchMedia(`(min-width: ${value})`).matches) {
      match = name;
    }
  }
  return match;
}

function createResizeService(): Service<ResizeProps> {
  const props: ResizeProps = {
    width: window.innerWidth,
    height: window.innerHeight,
    ratio: window.innerWidth / window.innerHeight,
    orientation: orientationFor(window.innerWidth / window.innerHeight),
    breakpoint: currentBreakpoint(),
  };

  function update(): ResizeProps {
    props.width = window.innerWidth;
    props.height = window.innerHeight;
    props.ratio = props.width / props.height;
    props.orientation = orientationFor(props.ratio);
    props.breakpoint = currentBreakpoint();
    return props;
  }

  return createService<ResizeProps>({
    props: () => props,
    start(emit) {
      // A `ResizeObserver` rather than the `resize` event: it reports the
      // element's real box, so a zoom, a scrollbar appearing or a mobile
      // toolbar sliding away are all seen — and it delivers the current
      // size on `observe()`, so a subscriber learns where it stands without
      // waiting for the first resize. No debounce is needed either: the
      // observer already delivers at most once per frame.
      const observer = new ResizeObserver(() => emit(update()));
      observer.observe(document.documentElement);
      return () => observer.disconnect();
    },
  });
}

let service: Service<ResizeProps> | undefined;

/**
 * Use the resize service.
 *
 * ```js
 * const unsubscribe = useResize().add(({ width, orientation, breakpoint }) => {
 *   el.hidden = breakpoint === 'xxs';
 * });
 * ```
 */
export function useResize(): Service<ResizeProps> {
  service ??= createResizeService();
  return service;
}
