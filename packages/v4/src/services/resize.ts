import { createServiceMixin, type ServiceMixinOptions } from './mixin.js';
import { createService, perTarget, type Service } from './service.js';

export type ResizeOrientation = 'square' | 'landscape' | 'portrait';

/**
 * Named viewport widths, ascending. Values are the ones v3 ships, in `rem`
 * so they follow the root font size. They are the default set, not the only
 * one: `setBreakpoints()` replaces them.
 */
export const BREAKPOINTS: Readonly<Record<string, string>> = {
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
  /**
   * Name of the widest breakpoint the viewport currently matches. Media
   * queries answer about the viewport, so this describes the page rather
   * than the observed target.
   */
  breakpoint: string;
}

let breakpoints: Record<string, string> = { ...BREAKPOINTS };

/**
 * Built on first use and kept — constructing a `MediaQueryList` per
 * breakpoint on every resize measured 5.2× the cost of querying lists made
 * once (`Service.bench.ts`). Dropped when the set changes.
 */
let queries: Array<readonly [string, MediaQueryList]> | null = null;

/**
 * Replace the named breakpoints, ascending. Takes effect on the next
 * update, for every running service.
 *
 * ```js
 * setBreakpoints({ mobile: '0rem', tablet: '48rem', desktop: '80rem' });
 * ```
 *
 * The design has `defineFeatures` carry these eventually; until it exists,
 * this is the whole configuration surface.
 */
export function setBreakpoints(next: Record<string, string>): void {
  breakpoints = { ...next };
  queries = null;
}

/**
 * The breakpoints in use, the defaults until `setBreakpoints()` says
 * otherwise.
 */
export function getBreakpoints(): Record<string, string> {
  return { ...breakpoints };
}

function orientationFor(ratio: number): ResizeOrientation {
  if (ratio > 1) return 'landscape';
  if (ratio < 1) return 'portrait';
  return 'square';
}

/**
 * The widest matching name. The set is ascending, so the last match wins.
 */
function currentBreakpoint(): string {
  queries ??= Object.entries(breakpoints).map(
    ([name, value]) => [name, window.matchMedia(`(min-width: ${value})`)] as const,
  );
  let match = '';
  for (const [name, query] of queries) {
    if (query.matches) {
      match = name;
    }
  }
  return match;
}

function createResizeService(target: Element): Service<ResizeProps> {
  const props: ResizeProps = {
    width: target.clientWidth,
    height: target.clientHeight,
    ratio: target.clientWidth / target.clientHeight,
    orientation: orientationFor(target.clientWidth / target.clientHeight),
    breakpoint: currentBreakpoint(),
  };

  function update(): ResizeProps {
    // The element's inner box, which for `document.documentElement` is the
    // viewport — minus the classic scrollbar `innerWidth` counts in.
    props.width = target.clientWidth;
    props.height = target.clientHeight;
    props.ratio = props.width / props.height;
    props.orientation = orientationFor(props.ratio);
    props.breakpoint = currentBreakpoint();
    return props;
  }

  return createService<ResizeProps>({
    props: () => props,
    start(emit) {
      // Both mechanisms, because neither sees what the other does.
      //
      // The `ResizeObserver` reports the element's real box, so a zoom or a
      // scrollbar appearing — which changes the layout viewport with no
      // `resize` event at all — is caught; and it delivers the current size
      // on `observe()`, so a subscriber learns where it stands without
      // waiting for a resize. No debounce is needed either: the observer
      // already delivers at most once per frame.
      //
      // The `resize` event catches what the observer structurally cannot.
      // For the root element, `clientWidth`/`clientHeight` are the *viewport*
      // rather than the element's box, and on a page taller than the viewport
      // the box does not move when the viewport height does — a mobile
      // toolbar sliding away, the on-screen keyboard opening. Measured on a
      // 3000 px document: the observer reports height 3000 while
      // `clientHeight` is 896.
      // Neither is a debounced version of the other, and a resize that both
      // report is announced twice with the same values — cheap, and cheaper
      // than a coalescing task that would delay the delivery `observe()`
      // makes on subscribe.
      const publish = () => emit(update());
      const observer = new ResizeObserver(publish);
      observer.observe(target);
      const isViewport = target === document.documentElement;
      if (isViewport) {
        window.addEventListener('resize', publish, { passive: true });
      }

      return () => {
        observer.disconnect();
        if (isViewport) {
          window.removeEventListener('resize', publish);
        }
      };
    },
  });
}

const resizeServices = /* @__PURE__ */ perTarget(createResizeService);

/**
 * Use the resize service for an element, the document element by default.
 *
 * ```js
 * const unsubscribe = useResize().add(({ width, orientation, breakpoint }) => {
 *   el.hidden = breakpoint === 'xxs';
 * });
 *
 * useResize(card).add(({ width }) => { … });
 * ```
 *
 * One service per element: the props describe that element's box, and its
 * observer is disconnected when its own last subscriber leaves.
 */
export function useResize(target: Element = document.documentElement): Service<ResizeProps> {
  return resizeServices(target);
}

/**
 * Use the resize service for the viewport — `useResize()` named, the way
 * VueUse splits `useElementSize(el)` from `useWindowSize()`.
 */
export function useWindowSize(): Service<ResizeProps> {
  return resizeServices(document.documentElement);
}

/** The method `withResize()` subscribes for the component. */
export interface ResizeHook {
  resized?(props: ResizeProps): void;
}

export type ResizeMixinOptions = ServiceMixinOptions<Element>;

/**
 * Subscribe a component's `resized()` method to the resize service, for its
 * whole mount cycle:
 *
 * ```js
 * class Grid extends withResize(Base) {
 *   resized({ breakpoint }) {
 *     this.$el.dataset.breakpoint = breakpoint;
 *   }
 * }
 *
 * // The component's own box instead of the viewport.
 * class Card extends withResize(Base, { target: (instance) => instance.$el }) {
 *   resized({ width }) { … }
 * }
 * ```
 *
 * The document element is the default target, as `useResize()` with no
 * argument. The decorator form `@withResize()` is the same thing with a
 * build step.
 */
export const withResize = /* @__PURE__ */ createServiceMixin<ResizeHook, Element>({
  hook: 'resized',
  target: () => document.documentElement,
  use: (target) => useResize(target),
});
