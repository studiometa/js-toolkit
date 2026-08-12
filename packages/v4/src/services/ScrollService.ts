import { scheduler, type ScheduledTask } from '../scheduler.js';
import { createServiceMixin, type ServiceMixinOptions } from './mixin.js';
import { createService, perTarget, type Service } from './Service.js';

/** Anything that scrolls: the window, or an element with an overflow. */
export type ScrollTarget = Element | Window;

/**
 * Props are flat, one per axis, with v3's spelling: a handler destructures
 * what it needs (`{ deltaY, isDown }`) instead of reaching through a group.
 */
export interface ScrollProps {
  x: number;
  y: number;
  /** Whether the axis moved in this update. */
  changedX: boolean;
  changedY: boolean;
  /** Position at the previous update. */
  lastX: number;
  lastY: number;
  deltaX: number;
  deltaY: number;
  /** Furthest scrollable position, `0` when the axis does not scroll. */
  maxX: number;
  maxY: number;
  /** Position over the maximum, from `0` to `1`. */
  progressX: number;
  progressY: number;
  isUp: boolean;
  isRight: boolean;
  isDown: boolean;
  isLeft: boolean;
  /**
   * Whether the target is still moving. It turns off on `scrollend`, which
   * covers momentum, smooth-scrolling and snap settling alike — a component
   * waiting for a scroll to finish should read this rather than time out on
   * its own.
   */
  isScrolling: boolean;
}

/**
 * `scrollend` where it exists — Safari only gained it recently, and there is
 * no polyfill worth the name, so a quiet period stands in for it. Long
 * enough not to fire between two momentum frames, short enough to feel
 * immediate.
 */
const SCROLL_END_FALLBACK_DELAY = 120;

const supportsScrollEnd = /* @__PURE__ */ (() =>
  typeof window !== 'undefined' && 'onscrollend' in window)();

/**
 * Where the target stands and how far it can go. The window scrolls the
 * document, so its maximums come from the scrolling element rather than from
 * the window itself.
 */
function measure(target: ScrollTarget) {
  if (target instanceof Window) {
    const scrollingElement = document.scrollingElement ?? document.documentElement;
    return {
      x: target.scrollX,
      y: target.scrollY,
      maxX: scrollingElement.scrollWidth - target.innerWidth,
      maxY: scrollingElement.scrollHeight - target.innerHeight,
    };
  }
  return {
    x: target.scrollLeft,
    y: target.scrollTop,
    maxX: target.scrollWidth - target.clientWidth,
    maxY: target.scrollHeight - target.clientHeight,
  };
}

function createScrollService(target: ScrollTarget): Service<ScrollProps> {
  const initial = measure(target);
  const props: ScrollProps = {
    x: initial.x,
    y: initial.y,
    changedX: false,
    changedY: false,
    lastX: initial.x,
    lastY: initial.y,
    deltaX: 0,
    deltaY: 0,
    maxX: initial.maxX,
    maxY: initial.maxY,
    progressX: initial.maxX === 0 ? 1 : initial.x / initial.maxX,
    progressY: initial.maxY === 0 ? 1 : initial.y / initial.maxY,
    isUp: false,
    isRight: false,
    isDown: false,
    isLeft: false,
    isScrolling: false,
  };

  function update(): ScrollProps {
    const lastX = props.x;
    const lastY = props.y;
    const { x, y, maxX, maxY } = measure(target);

    props.x = x;
    props.y = y;
    props.changedX = x !== lastX;
    props.changedY = y !== lastY;
    props.lastX = lastX;
    props.lastY = lastY;
    props.deltaX = x - lastX;
    props.deltaY = y - lastY;
    props.maxX = maxX;
    props.maxY = maxY;
    props.progressX = maxX === 0 ? 1 : x / maxX;
    props.progressY = maxY === 0 ? 1 : y / maxY;
    props.isUp = y < lastY;
    props.isRight = x > lastX;
    props.isDown = y > lastY;
    props.isLeft = x < lastX;

    return props;
  }

  return createService<ScrollProps>({
    props: () => props,
    start(emit) {
      let task: ScheduledTask<void> | null = null;
      let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

      const flush = () => {
        // One update per frame, in the phase where measuring is free.
        // v3 debounced instead, which cost 100 ms before the final position
        // was announced; a coalesced read always ends on the last event.
        task ??= scheduler.read(() => {
          task = null;
          emit(update());
        });
      };

      const onScrollEnd = () => {
        props.isScrolling = false;
        // Announced on its own, since the position has not changed: a
        // component waiting for the scroll to settle would otherwise never
        // hear about it.
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

      // A resize changes the maximums, and therefore the progress — but
      // nothing is moving, and no `scrollend` follows to take the flag back
      // down. Re-measure without entering the scrolling state.
      const onResize = () => flush();

      // Refresh before the first subscriber reads `props()`, and pick up the
      // maximums of the target as it is now.
      update();
      // On the target itself: `scroll` does not bubble, so listening here
      // reports this scroller and no other — an inner one would otherwise
      // wake the service to emit unchanged props.
      target.addEventListener('scroll', onScroll, { passive: true });
      if (supportsScrollEnd) {
        target.addEventListener('scrollend', onScrollEnd);
      }
      window.addEventListener('resize', onResize, { passive: true });

      return () => {
        task?.cancel();
        task = null;
        clearTimeout(fallbackTimer);
        props.isScrolling = false;
        target.removeEventListener('scroll', onScroll);
        target.removeEventListener('scrollend', onScrollEnd);
        window.removeEventListener('resize', onResize);
      };
    },
  });
}

const scrollServices = /* @__PURE__ */ perTarget(createScrollService);

/**
 * Use the scroll service for a target, the window by default.
 *
 * ```js
 * const unsubscribe = useScroll().add(({ y, progressY, isDown }) => {
 *   el.classList.toggle('is-hidden', isDown);
 * });
 *
 * useScroll(panel).add(({ progressY }) => { … });
 * ```
 *
 * One service per target: the props describe that scroller, and its
 * listeners are released when its own last subscriber leaves.
 */
export function useScroll(target: ScrollTarget = window): Service<ScrollProps> {
  return scrollServices(target);
}

/**
 * Use the scroll service for the window — `useScroll()` named, the way
 * VueUse splits `useScroll(el)` from `useWindowScroll()`.
 */
export function useWindowScroll(): Service<ScrollProps> {
  return scrollServices(window);
}

/** The method `withScroll()` subscribes for the component. */
export interface ScrollHook {
  scrolled?(props: ScrollProps): void;
}

export type ScrollMixinOptions = ServiceMixinOptions<ScrollTarget>;

/**
 * Subscribe a component's `scrolled()` method to the scroll service, for
 * its whole mount cycle:
 *
 * ```js
 * class Header extends withScroll(Base) {
 *   scrolled({ isDown }) {
 *     this.$el.classList.toggle('is-hidden', isDown);
 *   }
 * }
 *
 * // Another scroller, another method name — stack one per subscription.
 * class Panel extends withScroll(Base, {
 *   hook: 'panelScrolled',
 *   target: (instance) => instance.$el,
 * }) {
 *   panelScrolled({ progressY }) { … }
 * }
 * ```
 *
 * The window is the default target, as `useScroll()` with no argument. The
 * decorator form `@withScroll()` is the same thing with a build step.
 */
export const withScroll = /* @__PURE__ */ createServiceMixin<ScrollHook, ScrollTarget>({
  hook: 'scrolled',
  target: () => window,
  use: (target) => useScroll(target),
});
