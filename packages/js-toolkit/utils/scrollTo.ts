import { TweenOptions, tween } from './tween.js';
import { isFunction } from './is.js';
import { lerp } from './math/index.js';

// Rename ScrollToOptions type to ScrollPosition to be more understandable.
type ScrollPosition = ScrollToOptions;

// Set the type of TweenScrollToOptions options.
export type TweenScrollToOptions = TweenOptions & {
  /**
   * Root element that will be scrolled.
   */
  rootElement?: HTMLElement;
  /**
   * Scroll direction.
   */
  axis?: 'X' | 'Y' | 'BOTH';
  /**
   * Distance from the target.
   */
  offset?: number;
};

/**
 * Scroll to an element.
 *
 * @returns {Promise<ScrollPosition>} A promising resolving with the scroll position.
 */
export default function scrollTo(
  selectorElement: HTMLElement | string,
  { rootElement = null, axis = 'Y', offset = 0, ...tweenOptions }: TweenScrollToOptions = {},
): Promise<ScrollPosition> {
  /**
   * Get the current root element or window scroll position.
   *
   * @returns {ScrollPosition}
   */
  function getCurrentScrollPosition(): ScrollPosition {
    return rootElement
      ? {
          left: rootElement.scrollTop,
          top: rootElement.scrollLeft,
        }
      : {
          left: window.scrollX,
          top: window.scrollY,
        };
  }

  // Save the current scroll position.
  const initialScrollPosition = getCurrentScrollPosition();

  // Init the target element.
  let targetElement = null;

  // Check if the given element is a selector or already a HTMLElement.
  if (selectorElement instanceof HTMLElement) {
    targetElement = selectorElement;
  } else {
    targetElement = document.querySelector(selectorElement);
  }

  // Resolve the promise if there is no target element.
  if (!targetElement) {
    return Promise.resolve(initialScrollPosition);
  }

  // Get the size of the target element.
  const sizes = targetElement.getBoundingClientRect();

  // Get the scroll margins of the target element.
  const targetElementComputedStyle = getComputedStyle(targetElement);
  const scrollMargin = {
    left: Number.parseInt(targetElementComputedStyle.scrollMarginLeft || '0', 10),
    top: Number.parseInt(targetElementComputedStyle.scrollMarginTop || '0', 10),
  };

  // Get the maximum scroll of the root element or of the window.
  const max = rootElement
    ? {
        left: rootElement.scrollWidth - rootElement.offsetWidth,
        top: rootElement.scrollHeight - rootElement.offsetHeight,
      }
    : {
        left: document.documentElement.scrollWidth - window.innerWidth,
        top: document.documentElement.scrollHeight - window.innerHeight,
      };

  // Get the scroll position (or maximum scroll) of the target element.
  const targetElementScrollPosition = {
    left: Math.min(sizes.left + initialScrollPosition.left - scrollMargin.left - offset, max.left),
    top: Math.min(sizes.top + initialScrollPosition.top - scrollMargin.top - offset, max.top),
  };

  // Create the final promise.
  return new Promise((resolve) => {
    // Init tween.
    let tw = null;

    // Set the event handler.
    const eventHandler = () => {
      // Pause the tween animation.
      tw.pause();

      // Remove the event listeners.
      if (rootElement) {
        rootElement.removeEventListener('wheel', eventHandler);
        rootElement.removeEventListener('touchmove', eventHandler);
      } else {
        window.removeEventListener('wheel', eventHandler);
        window.removeEventListener('touchmove', eventHandler);
      }

      // Resolve the promise if the user interact with wheel or touchmove.
      resolve(getCurrentScrollPosition());
    };

    // Setup tween.
    tw = tween(
      (progress) => {
        // Scroll to the progress scroll position.
        (rootElement ?? window).scrollTo({
          left:
            axis === 'X' || axis === 'BOTH'
              ? lerp(initialScrollPosition.left, targetElementScrollPosition.left, progress)
              : initialScrollPosition.left,
          top:
            axis === 'Y' || axis === 'BOTH'
              ? lerp(initialScrollPosition.top, targetElementScrollPosition.top, progress)
              : initialScrollPosition.top,
        });
      },
      {
        // Use tween options.
        ...tweenOptions,

        // Set finish actions.
        onFinish(progress) {
          // Remove the event listeners.
          if (rootElement) {
            rootElement.removeEventListener('wheel', eventHandler);
            rootElement.removeEventListener('touchmove', eventHandler);
          } else {
            window.removeEventListener('wheel', eventHandler);
            window.removeEventListener('touchmove', eventHandler);
          }

          // Run onFinish function passed in options.
          if (isFunction(tweenOptions.onFinish)) {
            tweenOptions.onFinish(progress);
          }

          // Resolve the promise on animation finish.
          resolve(getCurrentScrollPosition());
        },
      },
    );

    // Set the event listeners to catch user interaction
    if (rootElement) {
      rootElement.addEventListener('wheel', eventHandler, { passive: true });
      rootElement.addEventListener('touchmove', eventHandler, { passive: true });
    } else {
      window.addEventListener('wheel', eventHandler, { passive: true });
      window.addEventListener('touchmove', eventHandler, { passive: true });
    }

    // Start the tween animation.
    tw.start();
  });
}
