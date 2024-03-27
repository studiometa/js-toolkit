import { TweenOptions, tween } from './tween.js';
import { isFunction } from './is.js';
import { lerp } from './math/index.js';

export type ScrollToOptions = TweenOptions & {
  /**
   * Distance from the target.
   */
  offset?: number;
};

/**
 * Handler for the click event on anchor links
 *
 * @returns {Promise<number>} A promising resolving with the target scroll position.
 */
export default function scrollTo(
  selectorElement: HTMLElement | string,
  { offset = 0, ...tweenOptions }: ScrollToOptions = {},
): Promise<number> {
  let targetElement = null;
  const scroll = window.scrollY;

  if (selectorElement instanceof HTMLElement) {
    targetElement = selectorElement;
  } else {
    targetElement = document.querySelector(selectorElement);
  }

  if (!targetElement) {
    return Promise.resolve(scroll);
  }

  const sizes = targetElement.getBoundingClientRect();
  const scrollMargin = getComputedStyle(targetElement).scrollMarginTop || '0';
  const max = document.documentElement.scrollHeight - window.innerHeight;
  let scrollTarget = sizes.top + scroll - Number.parseInt(scrollMargin, 10) - offset;

  // Make sure to not scroll more than the max scroll allowed
  if (scrollTarget > max) {
    scrollTarget = max;
  }

  return new Promise((resolve) => {
    let tw = null;

    const eventHandler = () => {
      tw.pause();

      window.removeEventListener('wheel', eventHandler);
      window.removeEventListener('touchmove', eventHandler);

      resolve(window.scrollY);
    };

    tw = tween(
      (progress) => {
        window.scrollTo(0, lerp(scroll, scrollTarget, progress));
      },
      {
        ...tweenOptions,
        onFinish(progress) {
          window.removeEventListener('wheel', eventHandler);
          window.removeEventListener('touchmove', eventHandler);

          if (isFunction(tweenOptions.onFinish)) {
            tweenOptions.onFinish(progress);
          }

          resolve(window.scrollY);
        },
      },
    );

    window.addEventListener('wheel', eventHandler, { passive: true });
    window.addEventListener('touchmove', eventHandler, { passive: true });

    tw.start();
  });
}
