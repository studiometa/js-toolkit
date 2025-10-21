import type { BaseConstructor } from '../Base/index.js';
import { getComponentResolver } from '../utils/index.js';

/**
 * Import a component when given media query is true.
 *
 * @template {BaseConstructor} T
 * @param {() => Promise<T|{default:T}>} fn
 *   The import function.
 * @param {string} media
 *   The media query name and value (see https://developer.mozilla.org/en-US/docs/Web/CSS/@media#media_features)
 * @return {Promise<T>}
 * @link https://js-toolkit.studiometa.dev/api/helpers/importOnMediaQuery.html
*/
export function importOnMediaQuery<T extends BaseConstructor = BaseConstructor>(
  fn: () => Promise<T | { default: T }>,
  media: string,
): Promise<T> {
  const resolver = getComponentResolver(fn);

  return new Promise((resolve) => {
    const mediaQueryList = window.matchMedia(media);

    if (mediaQueryList.matches) {
      resolver(resolve);
    }

    const changeHandler = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setTimeout(() => {
          // Remove listener and mount the component
          resolver(resolve, () => mediaQueryList.removeEventListener('change', changeHandler));
        }, 0);
      }
    };

    // Start listening for changes
    mediaQueryList.addEventListener('change', changeHandler);
  });
}
