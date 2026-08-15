import { defaultScheduler, type ScheduledTask } from '../scheduler.js';
import { getSharedRuntimeSlot } from '../shared-runtime.js';
import { createServiceMixin, type ServiceHandles, type ServiceMixinOptions } from './mixin.js';
import { createService, perTarget, type MutableProps, type Service } from './service.js';

/** Anything that scrolls: the window, or an element with an overflow. */
export type ScrollTarget = Element | Window;

/**
 * Which way an axis moved in this update: `1` forward, `-1` back, `0` not at
 * all.
 *
 * One signed value rather than four booleans, because it **multiplies** —
 * `offset * directionY` leans a header the way the page is going — where a
 * pair of flags has to be branched on. It also settles a collision: a
 * `ScrollProps.isDown` that meant "scrolling down" sat next to a
 * `PointerProps.isDown` that means "pressed".
 */
export type ScrollDirection = -1 | 0 | 1;

/**
 * Props are flat, one per axis: a handler destructures what it needs
 * (`{ deltaY, directionY }`) instead of reaching through a group. Nothing that
 * can be derived from another field is a field.
 */
export interface ScrollProps {
  readonly x: number;
  readonly y: number;
  /**
   * Movement since the previous update. The previous position is `x - deltaX`,
   * and "did this axis move" is `deltaX !== 0`, so neither is a field.
   */
  readonly deltaX: number;
  readonly deltaY: number;
  /** Furthest scrollable position, `0` when the axis does not scroll. */
  readonly maxX: number;
  readonly maxY: number;
  /**
   * Position over the maximum, from `0` to `1`. Distance travelled from the
   * start of the axis, so a right-to-left container — where `scrollLeft`
   * counts *down* from `0` at the right edge — reports the same `0` to `1`
   * as any other, and an axis that cannot scroll reports `0`.
   */
  readonly progressX: number;
  readonly progressY: number;
  readonly directionX: ScrollDirection;
  readonly directionY: ScrollDirection;
  /**
   * Whether the target is still moving. It turns off on `scrollend`, which
   * covers momentum, smooth-scrolling and snap settling alike — a component
   * waiting for a scroll to finish should read this rather than time out on
   * its own.
   */
  readonly isScrolling: boolean;
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
      // Clamped, because the two terms do not agree about the scrollbar:
      // `innerWidth` counts the classic one, `scrollWidth` does not. On a page
      // that only scrolls vertically — the common case — the subtraction is
      // therefore negative by the scrollbar's width wherever scrollbars take
      // up space, which is desktop Chrome and Firefox. A negative maximum
      // contradicts what the prop promises, and it made every consumer that
      // divides by it read backwards.
      maxX: Math.max(0, scrollingElement.scrollWidth - target.innerWidth),
      maxY: Math.max(0, scrollingElement.scrollHeight - target.innerHeight),
    };
  }
  return {
    x: target.scrollLeft,
    y: target.scrollTop,
    // Clamped for the same reason, though the element case is better behaved:
    // `scrollWidth` is specified never to fall under `clientWidth`, so this
    // guards the rounding at fractional zoom rather than a whole scrollbar.
    maxX: Math.max(0, target.scrollWidth - target.clientWidth),
    maxY: Math.max(0, target.scrollHeight - target.clientHeight),
  };
}

/**
 * How far along the axis the target is, as a distance travelled from its
 * start rather than as a raw position over the maximum. A right-to-left
 * container scrolls from `0` at the right edge *down* to `-maxX`, and the
 * maximum stays positive, so dividing one by the other gave a negative
 * progress — measured `progressX: -0.56` at `scrollLeft: -500` with
 * `maxX: 900`.
 *
 * An axis that cannot scroll is at its start, not at its end: reporting `1`
 * told an empty carousel it had reached the last slide.
 */
function directionOf(delta: number): ScrollDirection {
  if (delta > 0) return 1;
  if (delta < 0) return -1;
  return 0;
}

function progressFor(position: number, max: number): number {
  // `max <= 0` rather than `max === 0`: the extents are clamped at the source,
  // and this is the second lock on the same door — a maximum that is not
  // positive means the axis does not scroll, which puts it at its start. It
  // also avoids handing back `-0`, which compares equal to `0` and prints as
  // `-0` in every log a consumer writes.
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

  /**
   * Re-measure for the start of a run, and drop the movement.
   *
   * "Since the previous update" has no meaning across a stop: the position the
   * delta would be measured against belongs to a run that ended, at a scroll
   * position the page has since left. A service restarted after the page moved
   * would otherwise announce a scroll nobody performed — visible now that
   * `{ immediate: true }` hands these props straight to a subscriber.
   */
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
        // One update per frame, in the phase where measuring is free.
        // v3 debounced instead, which cost 100 ms before the final position
        // was announced; a coalesced read always ends on the last event.
        task ??= defaultScheduler.read(() => {
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

      /**
       * Content growing changes how far the target can scroll, and nothing
       * announces it: no `resize`, no `scroll`. A carousel whose slides load,
       * an accordion opening, a list appending — the extents stayed at their
       * subscribe-time values, so `maxY` read 400 for content that had gone
       * from 500 to 5000 px, and every `progress` derived from it was wrong.
       *
       * A scroll container's own box never grows with its content, so the
       * observer has to watch the children as well, and a `childList`
       * `MutationObserver` keeps that set in sync as children come and go.
       * That is the price: one `ResizeObserver` over `1 + n` boxes and one
       * `MutationObserver` per scroller, both released with the last
       * subscriber like everything else here.
       */
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

      // Refresh before the first subscriber reads `props()`, and pick up the
      // maximums of the target as it is now.
      resync();
      // On the target itself: `scroll` does not bubble, so listening here
      // reports this scroller and no other — an inner one would otherwise
      // wake the service to emit unchanged props.
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

/**
 * Use the scroll service for a target, the window by default.
 *
 * ```js
 * const unsubscribe = useScroll().subscribe(({ y, progressY, directionY }) => {
 *   el.classList.toggle('is-hidden', directionY === 1);
 * });
 *
 * useScroll(panel).subscribe(({ progressY }) => { … });
 * ```
 *
 * One service per target: the props describe that scroller, and its
 * listeners are released when its own last subscriber leaves.
 */
export function useScroll(target: ScrollTarget = window): Service<ScrollProps> {
  // The document scroller *is* the window scroller, and its `scroll` events
  // are dispatched at the document rather than at the element. Keying a
  // second service on it forked one scroller into two, one of which would
  // never hear an event.
  if (target === document.scrollingElement || target === document.documentElement) {
    return scrollServices(window);
  }
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
 *   scrolled({ directionY }) {
 *     this.$el.classList.toggle('is-hidden', directionY === 1);
 *   }
 * }
 *
 * // Another scroller: the component's own overflow instead of the window.
 * class Panel extends withScroll(Base, { target: (instance) => instance.$el }) {
 *   scrolled({ progressY }) { … }
 * }
 * ```
 *
 * The window is the default target, as `useScroll()` with no argument. The
 * decorator form `@withScroll()` is the same thing with a build step.
 */
export const withScroll = /* @__PURE__ */ createServiceMixin<
  ScrollHook & ServiceHandles<'scrolled'>,
  ScrollTarget
>({
  hook: 'scrolled',
  target: () => window,
  use: (target) => useScroll(target),
});
