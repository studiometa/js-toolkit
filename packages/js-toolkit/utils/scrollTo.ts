import { tween } from './tween.js';
import type { TweenOptions } from './tween.js';
import { isString, isNumber, isFunction } from './is.js';
import { lerp } from './math/index.js';

export type ScrollPosition = {
  left: number;
  top: number;
};

export type ScrollTarget = string | HTMLElement | number | Partial<ScrollPosition>;

export type ScrollToOptions = TweenOptions & {
  /**
   * Root element that will be scrolled.
   */
  rootElement?: HTMLElement | typeof window;
  /**
   * Scroll direction.
   */
  axis?: (typeof scrollTo.axis)[keyof typeof scrollTo.axis];
  /**
   * Distance from the target.
   */
  offset?: number;
};

const xAxis = Symbol(0);
const yAxis = Symbol(1);
const bothAxis = Symbol(2);

function isHtmlElement(rootElement: ScrollToOptions['rootElement']): rootElement is HTMLElement {
  return rootElement instanceof HTMLElement;
}

/**
 * Get the current root element or window scroll position.
 */
function getCurrentScrollPosition(rootElement: ScrollToOptions['rootElement']): ScrollPosition {
  return {
    left: isHtmlElement(rootElement) ? rootElement.scrollTop : rootElement.scrollX,
    top: isHtmlElement(rootElement) ? rootElement.scrollLeft : rootElement.scrollY,
  };
}

/**
 * Get the maximum scroll position values.
 */
function getMaxScrollPosition(rootElement?: ScrollToOptions['rootElement']): ScrollPosition {
  return {
    left: isHtmlElement(rootElement)
      ? rootElement.scrollWidth - rootElement.offsetWidth
      : document.documentElement.scrollWidth - window.innerWidth,
    top: isHtmlElement(rootElement)
      ? rootElement.scrollHeight - rootElement.offsetHeight
      : document.documentElement.scrollHeight - window.innerHeight,
  };
}

/**
 * Get the target scroll position.
 */
function getTargetScrollPosition(
  initialScrollPosition: ScrollPosition,
  maxScrollPosition: ScrollPosition,
  target: ScrollTarget,
  axis: ScrollToOptions['axis'],
  offset: number,
): ScrollPosition {
  let { top, left } = initialScrollPosition;

  if (target instanceof HTMLElement || isString(target)) {
    const targetElement = target instanceof HTMLElement ? target : document.querySelector(target);

    if (!targetElement) {
      return { top, left };
    }

    const sizes = targetElement.getBoundingClientRect();
    const styles = getComputedStyle(targetElement);
    const scrollMargin = {
      left: Number.parseInt(styles.scrollMarginLeft || '0', 10),
      top: Number.parseInt(styles.scrollMarginTop || '0', 10),
    };

    // Set the scroll position of the target element.
    left = sizes.left + initialScrollPosition.left - scrollMargin.left;
    top = sizes.top + initialScrollPosition.top - scrollMargin.top;
  } else if (isNumber(target)) {
    left = target;
    top = target;
  } else {
    left = target.left ?? left;
    top = target.top ?? top;
  }

  left -= offset;
  top -= offset;

  if (axis !== bothAxis) {
    if (axis !== xAxis) {
      left = initialScrollPosition.left;
    }

    if (axis !== yAxis) {
      top = initialScrollPosition.top;
    }
  }

  return {
    left: Math.min(left, maxScrollPosition.left),
    top: Math.min(top, maxScrollPosition.top),
  };
}

/**
 * Scroll to an element.
 *
 * @returns {Promise<ScrollPosition>} A promising resolving with the scroll position.
 */
export function scrollTo(
  target: string | HTMLElement | number | Partial<ScrollPosition>,
  { rootElement = window, axis = yAxis, offset = 0, ...tweenOptions }: ScrollToOptions = {},
): Promise<ScrollPosition> {
  const initialScrollPosition = getCurrentScrollPosition(rootElement);
  const maxScrollPosition = getMaxScrollPosition(rootElement);
  const targetScrollPosition = getTargetScrollPosition(
    initialScrollPosition,
    maxScrollPosition,
    target,
    axis,
    offset,
  );

  return new Promise((resolve) => {
    function eventHandler() {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      tw.pause();
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      stop();
    }

    function stop() {
      rootElement.removeEventListener('wheel', eventHandler);
      rootElement.removeEventListener('touchmove', eventHandler);

      // Resolve the promise on animation finish.
      resolve(getCurrentScrollPosition(rootElement));
    }

    // Setup tween.
    const tw = tween(
      (progress) => {
        rootElement.scrollTo({
          left: lerp(initialScrollPosition.left, targetScrollPosition.left, progress),
          top: lerp(initialScrollPosition.top, targetScrollPosition.top, progress),
        });
      },
      {
        ...tweenOptions,
        onFinish(progress) {
          if (isFunction(tweenOptions.onFinish)) {
            tweenOptions.onFinish(progress);
          }

          stop();
        },
      },
    );

    rootElement.addEventListener('wheel', eventHandler, { passive: true });
    rootElement.addEventListener('touchmove', eventHandler, { passive: true });
    tw.start();
  });
}

scrollTo.axis = {
  x: xAxis,
  y: yAxis,
  both: bothAxis,
};
