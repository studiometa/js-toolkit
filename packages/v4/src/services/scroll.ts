import { defaultScheduler, type ScheduledTask } from '../scheduler.js';
import { getSharedRuntimeSlot } from '../shared-runtime.js';
import { createServiceMixin, type ServiceHandles, type ServiceMixinOptions } from './mixin.js';
import { createService, perTarget, type MutableProps, type Service } from './service.js';

/** Anything that scrolls: the window, or an element with an overflow. */
export type ScrollTarget = Element | Window;

/** Axis direction: `1` forward, `-1` backward, or `0` unchanged. */
export type ScrollDirection = -1 | 0 | 1;

/** Current scroll state and movement. */
export interface ScrollProps {
  readonly x: number;
  readonly y: number;
  /** Movement since the previous update. */
  readonly deltaX: number;
  readonly deltaY: number;
  /** Furthest scrollable position, `0` when the axis does not scroll. */
  readonly maxX: number;
  readonly maxY: number;
  /** Progress from the logical start, from `0` to `1`. A fixed axis reports `0`. */
  readonly progressX: number;
  readonly progressY: number;
  readonly directionX: ScrollDirection;
  readonly directionY: ScrollDirection;
  /** Whether the target is moving, including momentum, smooth scroll, and snap settling. */
  readonly isScrolling: boolean;
}

/** Quiet-period fallback for browsers without `scrollend`. */
const SCROLL_END_FALLBACK_DELAY = 120;

const supportsScrollEnd = /* @__PURE__ */ (() =>
  typeof window !== 'undefined' && 'onscrollend' in window)();

/** The element whose content decides how far the target can scroll. */
function scrollerOf(target: ScrollTarget): Element {
  if (target instanceof Window) {
    return document.scrollingElement ?? document.documentElement;
  }
  return target;
}

/**
 * Where the target stands and how far it can go. The window scrolls the
 * document, so its maximums come from the scrolling element rather than from
 * the window itself.
 */
function measure(target: ScrollTarget) {
  if (target instanceof Window) {
    const scrollingElement = scrollerOf(target);
    return {
      x: target.scrollX,
      y: target.scrollY,
      // Classic scrollbars can make `scrollWidth - innerWidth` negative.
      maxX: Math.max(0, scrollingElement.scrollWidth - target.innerWidth),
      maxY: Math.max(0, scrollingElement.scrollHeight - target.innerHeight),
    };
  }
  return {
    x: target.scrollLeft,
    y: target.scrollTop,
    // Clamp fractional-zoom rounding.
    maxX: Math.max(0, target.scrollWidth - target.clientWidth),
    maxY: Math.max(0, target.scrollHeight - target.clientHeight),
  };
}

/** Resolve progress from the logical start, including negative RTL `scrollLeft`. */
function directionOf(delta: number): ScrollDirection {
  if (delta > 0) return 1;
  if (delta < 0) return -1;
  return 0;
}

function progressFor(position: number, max: number): number {
  // A non-positive extent is fixed at the start and must not produce `-0`.
  return max <= 0 ? 0 : Math.abs(position) / max;
}

function createScrollService(target: ScrollTarget): Service<ScrollProps> {
  const initial = measure(target);
  const props: MutableProps<ScrollProps> = {
    x: initial.x,
    y: initial.y,
    deltaX: 0,
    deltaY: 0,
    maxX: initial.maxX,
    maxY: initial.maxY,
    progressX: progressFor(initial.x, initial.maxX),
    progressY: progressFor(initial.y, initial.maxY),
    directionX: 0,
    directionY: 0,
    isScrolling: false,
  };

  function update(): ScrollProps {
    const lastX = props.x;
    const lastY = props.y;
    const { x, y, maxX, maxY } = measure(target);

    props.x = x;
    props.y = y;
    props.deltaX = x - lastX;
    props.deltaY = y - lastY;
    props.maxX = maxX;
    props.maxY = maxY;
    props.progressX = progressFor(x, maxX);
    props.progressY = progressFor(y, maxY);
    props.directionX = directionOf(props.deltaX);
    props.directionY = directionOf(props.deltaY);

    return props;
  }

  /** Re-measure at startup and reset movement from the previous run. */
  function resync(): ScrollProps {
    update();
    props.deltaX = 0;
    props.deltaY = 0;
    props.directionX = 0;
    props.directionY = 0;
    return props;
  }

  return createService<ScrollProps>({
    props: () => props,
    start(emit) {
      let task: ScheduledTask<void> | null = null;
      let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

      const flush = () => {
        // Coalesce measurements into the scheduler read phase.
        task ??= defaultScheduler.read(() => {
          task = null;
          emit(update());
        });
      };

      const onScrollEnd = () => {
        props.isScrolling = false;
        // Emit the settled state even when position is unchanged.
        flush();
      };

      const onScroll = () => {
        props.isScrolling = true;
        if (!supportsScrollEnd) {
          clearTimeout(fallbackTimer);
          fallbackTimer = setTimeout(onScrollEnd, SCROLL_END_FALLBACK_DELAY);
        }
        flush();
      };

      // Resize changes extents without entering the scrolling state.
      const onResize = () => flush();

      /** Observe child boxes and child-list changes because content can change extents without resizing the container. */
      const scroller = scrollerOf(target);
      const refreshExtents = () => {
        const { maxX, maxY } = measure(target);
        if (maxX !== props.maxX || maxY !== props.maxY) {
          flush();
        }
      };
      const contentObserver = new ResizeObserver(refreshExtents);
      const observeContent = () => {
        contentObserver.disconnect();
        contentObserver.observe(scroller);
        for (const child of scroller.children) {
          contentObserver.observe(child);
        }
      };
      const childrenObserver = new MutationObserver(observeContent);

      // Refresh extents before immediate delivery.
      resync();
      // `scroll` does not bubble; listen on the observed scroller.
      target.addEventListener('scroll', onScroll, { passive: true });
      if (supportsScrollEnd) {
        target.addEventListener('scrollend', onScrollEnd);
      }
      window.addEventListener('resize', onResize, { passive: true });
      observeContent();
      childrenObserver.observe(scroller, { childList: true });

      return () => {
        task?.cancel();
        task = null;
        clearTimeout(fallbackTimer);
        contentObserver.disconnect();
        childrenObserver.disconnect();
        props.isScrolling = false;
        target.removeEventListener('scroll', onScroll);
        target.removeEventListener('scrollend', onScrollEnd);
        window.removeEventListener('resize', onResize);
      };
    },
  });
}

const scrollServices = /* @__PURE__ */ getSharedRuntimeSlot('service:scroll', 1, () =>
  perTarget(createScrollService),
);

/** Use one scroll service per target. Defaults to the window. */
export function useScroll(target: ScrollTarget = window): Service<ScrollProps> {
  // The document scrolling element uses the window service.
  if (target === document.scrollingElement || target === document.documentElement) {
    return scrollServices(window);
  }
  return scrollServices(target);
}

/**
 * Use the scroll service for the window.
 */
export function useWindowScroll(): Service<ScrollProps> {
  return scrollServices(window);
}

/** The method `withScroll()` subscribes for the component. */
export interface ScrollHook {
  scrolled?(props: ScrollProps): void;
}

export type ScrollMixinOptions = ServiceMixinOptions<ScrollTarget>;

/** Subscribe `scrolled()` for each mount cycle. The window is the default target. */
export const withScroll = /* @__PURE__ */ createServiceMixin<
  ScrollHook & ServiceHandles<'scrolled'>,
  ScrollTarget
>({
  hook: 'scrolled',
  target: () => window,
  use: (target) => useScroll(target),
});
