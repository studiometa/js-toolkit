import { usePrefersReducedMotion } from '../services/media.js';
import { isNumber, isString } from './is.js';
import { clamp } from './maths.js';

/** Where a scroller stands on both axes, in pixels from the start. */
export interface ScrollPosition {
  left: number;
  top: number;
}

/** What a scroll can be aimed at. */
export type ScrollToTarget = string | Element | number | Partial<ScrollPosition>;

/** The axes a scroll is allowed to move. */
export const SCROLL_AXES = /* @__PURE__ */ Object.freeze({
  x: 'x',
  y: 'y',
  both: 'both',
} as const);

export type ScrollAxis = (typeof SCROLL_AXES)[keyof typeof SCROLL_AXES];

/** Where an element comes to rest inside the scroller. */
export const SCROLL_ALIGNMENTS = /* @__PURE__ */ Object.freeze({
  start: 'start',
  center: 'center',
  end: 'end',
} as const);

export type ScrollAlign = (typeof SCROLL_ALIGNMENTS)[keyof typeof SCROLL_ALIGNMENTS];

export interface ScrollPositionOptions {
  /** What scrolls. Defaults to the window. */
  rootElement?: Element | Window;
  /** Which axes a target that names none may move. Defaults to `'y'`. */
  axis?: ScrollAxis;
  /** Pixels to stop short of the target. Defaults to `0`. */
  offset?: number;
  /**
   * Where an **element** target comes to rest, per axis. Defaults to `'start'`.
   *
   * The names are physical, like `axis`: this is `x` and `y`, not the
   * platform's `inline` and `block`, because nothing here maps a writing mode.
   * A number or a position target names its own destination, so it has nothing
   * to align.
   */
  align?: ScrollAlign | { x?: ScrollAlign; y?: ScrollAlign };
}

export interface ScrollToOptions extends ScrollPositionOptions {
  /** Defaults to `'smooth'`, or to `'instant'` when the reader asked for less motion. */
  behavior?: ScrollBehavior;
}

function currentPositionOf(root: Element | Window): ScrollPosition {
  return root instanceof Window
    ? { left: root.scrollX, top: root.scrollY }
    : { left: root.scrollLeft, top: root.scrollTop };
}

function maxPositionOf(root: Element | Window): ScrollPosition {
  // The window scrolls the document, so its extents come from the scroller.
  const scroller = root instanceof Window ? (document.scrollingElement ?? document.body) : root;
  const [width, height] =
    root instanceof Window
      ? [root.innerWidth, root.innerHeight]
      : [root.clientWidth, root.clientHeight];

  return {
    // Classic scrollbars and fractional zoom can make the difference negative.
    left: Math.max(0, scroller.scrollWidth - width),
    top: Math.max(0, scroller.scrollHeight - height),
  };
}

function pixels(value: string): number {
  return Number.parseFloat(value) || 0;
}

/** What the scroller shows at once, scrollbars excluded on both axes. */
function viewportOf(root: Element | Window): { width: number; height: number } {
  return root instanceof Window
    ? { width: root.innerWidth, height: root.innerHeight }
    : { width: root.clientWidth, height: root.clientHeight };
}

/**
 * How far past the start of the viewport the element rests.
 *
 * `start` is zero, which is why a caller that never asks for alignment pays
 * nothing and reads the same numbers it always did.
 */
function alignmentShift(align: ScrollAlign | undefined, viewport: number, size: number): number {
  if (align === SCROLL_ALIGNMENTS.center) {
    return (viewport - size) / 2;
  }
  if (align === SCROLL_ALIGNMENTS.end) {
    return viewport - size;
  }
  return 0;
}

/**
 * Where an element sits inside the root's scrolled content.
 *
 * `scroll-margin` is how a document asks to be stopped short of an element,
 * and it is honored here as `scrollIntoView()` honors it.
 */
function positionOfElement(
  element: Element,
  root: Element | Window,
  current: ScrollPosition,
  align: ScrollPositionOptions['align'],
): ScrollPosition {
  const rect = element.getBoundingClientRect();
  const styles = getComputedStyle(element);
  const viewport = viewportOf(root);
  const alignX = isString(align) ? align : align?.x;
  const alignY = isString(align) ? align : align?.y;
  let left =
    rect.left +
    current.left -
    pixels(styles.scrollMarginLeft) -
    alignmentShift(alignX, viewport.width, rect.width);
  let top =
    rect.top +
    current.top -
    pixels(styles.scrollMarginTop) -
    alignmentShift(alignY, viewport.height, rect.height);

  if (!(root instanceof Window)) {
    // A viewport coordinate is not a content coordinate for a scrolling
    // element: subtract where its padding box starts, borders included.
    const rootRect = root.getBoundingClientRect();
    const rootStyles = getComputedStyle(root);
    left -= rootRect.left + pixels(rootStyles.borderLeftWidth);
    top -= rootRect.top + pixels(rootStyles.borderTopWidth);
  }

  return { left, top };
}

/** The axes the target asks for, `undefined` on an axis it leaves alone. */
function requestedPosition(
  target: ScrollToTarget,
  root: Element | Window,
  current: ScrollPosition,
  axis: ScrollAxis,
  align: ScrollPositionOptions['align'],
): Partial<ScrollPosition> | null {
  // A position object names its own axes, so `axis` has nothing left to pick.
  if (!isString(target) && !isNumber(target) && !(target instanceof Element)) {
    return { left: target.left, top: target.top };
  }

  let position: ScrollPosition;

  if (isNumber(target)) {
    position = { left: target, top: target };
  } else {
    const element = isString(target) ? document.querySelector(target) : target;
    if (!element) {
      return null;
    }
    position = positionOfElement(element, root, current, align);
  }

  if (axis === SCROLL_AXES.x) {
    return { left: position.left };
  }
  if (axis === SCROLL_AXES.y) {
    return { top: position.top };
  }
  return position;
}

/**
 * Where a scroll would land, without scrolling.
 *
 * The measurement half of {@link scrollTo}, split out because a caller often
 * needs the number rather than the move: which slide is nearest, how far a
 * control has to travel, whether the destination is where the scroller
 * already stands. A target the document does not contain gives the current
 * position back, so the answer is always a position.
 *
 * @example
 * ```js
 * const { left } = scrollPosition(slide, { rootElement: track, axis: 'x', align: 'center' });
 * ```
 */
export function scrollPosition(
  target: ScrollToTarget,
  options: ScrollPositionOptions = {},
): ScrollPosition {
  const { rootElement = window, axis = SCROLL_AXES.y, offset = 0, align } = options;

  const current = currentPositionOf(rootElement);
  const requested = requestedPosition(target, rootElement, current, axis, align);

  if (!requested) {
    return current;
  }

  const max = maxPositionOf(rootElement);
  return {
    left: requested.left === undefined ? current.left : clamp(requested.left - offset, 0, max.left),
    top: requested.top === undefined ? current.top : clamp(requested.top - offset, 0, max.top),
  };
}

/**
 * Scroll to an element, a selector, a distance or a position, and get the
 * destination back. A target the document does not contain is a no-op.
 *
 * The browser owns the animation — this asks for it and returns. Smooth
 * scrolling is the default and becomes instant for a reader who asked for less
 * motion, which is read live rather than captured at load.
 *
 * @example
 * ```js
 * scrollTo('#section', { offset: 80 });
 * scrollTo({ left: 0 }, { rootElement: carousel });
 * scrollTo(slide, { rootElement: track, axis: 'x', align: 'center' });
 * ```
 */
export function scrollTo(target: ScrollToTarget, options: ScrollToOptions = {}): ScrollPosition {
  const { rootElement = window, behavior } = options;
  const destination = scrollPosition(target, options);

  rootElement.scrollTo({
    ...destination,
    // Reading the media query does not start the service.
    behavior: behavior ?? (usePrefersReducedMotion().props().matches ? 'instant' : 'smooth'),
  });

  return destination;
}
