import type { Base, BaseConstructor } from '../Base/index.js';

/**
 * Import a component when given media query is true.
 *
 * @template {BaseConstructor} T
 * @param {() => Promise<T|{default:T}>} fn
 *   The import function.
 * @param {string} media
 *   The media query name and value (see https://developer.mozilla.org/en-US/docs/Web/CSS/@media#media_features)
 * @returns {Promise<T>}
 */
export default function importOnMedia<T extends BaseConstructor = BaseConstructor>(
  fn: () => Promise<T | { default: T }>,
  media: string,
): Promise<T> {
  let ResolvedClass;

  const resolver = (resolve) => {
    fn().then((module) => {
      ResolvedClass = 'default' in module ? module.default : module;
      resolve(ResolvedClass);
    });
  };
  return new Promise((resolve) => {
    const { matches } = window.matchMedia(media);

    if (matches) {
      setTimeout(() => {
        resolver(resolve);
      }, 0);
    }
  });
}
