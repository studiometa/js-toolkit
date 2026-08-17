import { clamp } from '../../src/utils/maths.js';

/** A scroll offset pair, the shape both the wrapper and the drag track work in. */
export interface ScrollPosition {
  left: number;
  top: number;
}

/** The index of the number closest to the target. */
export function getClosestIndex(numbers: number[], target: number): number {
  let index = 0;
  let min = Number.POSITIVE_INFINITY;
  let closestIndex = 0;

  for (const number of numbers) {
    const absoluteDiff = Math.abs(number - target);

    if (absoluteDiff < min) {
      closestIndex = index;
      min = absoluteDiff;
    }

    index += 1;
  }

  return closestIndex;
}

/**
 * The scroll offsets that centre `element` inside `scroller`.
 *
 * v3 gets this from the `compute-scroll-into-view` package, called with
 * `block: 'center', inline: 'center'`. Core's own `scrollTo()` aligns a target
 * to the **start** of its scroller and takes no alignment option, so a carousel
 * that centres its slides cannot use it (gap 36) and this is the arithmetic
 * that replaces the dependency.
 */
export function centeredScrollPosition(element: Element, scroller: Element): ScrollPosition {
  const elementRect = element.getBoundingClientRect();
  const scrollerRect = scroller.getBoundingClientRect();

  const left =
    scroller.scrollLeft +
    (elementRect.left - scrollerRect.left) -
    (scrollerRect.width - elementRect.width) / 2;
  const top =
    scroller.scrollTop +
    (elementRect.top - scrollerRect.top) -
    (scrollerRect.height - elementRect.height) / 2;

  return {
    left: clamp(left, 0, scroller.scrollWidth - scroller.clientWidth),
    top: clamp(top, 0, scroller.scrollHeight - scroller.clientHeight),
  };
}
