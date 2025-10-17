import type { Base, BaseConstructor } from '../Base/index.js';
import { getTargetElements } from './utils.js';
import { getComponentResolver } from '../utils/index.js';

/**
 * Import a component when it is visible.
 *
 * @template {BaseConstructor} T
 * @param {() => Promise<T|{default:T}>} fn
 *   The import function.
 * @param {string|HTMLElement|HTMLElement[]} nameOrSelectorOrElement
 *   The name or selector for the component.
 * @param {Base} [parent]
 *   The parent component.
 * @param {IntersectionObserverInit} [observerOptions]
 *   Options for the `IntersectionObserver` instance.
 * @return {Promise<T>}
 * @link https://js-toolkit.studiometa.dev/api/helpers/importWhenVisible.html
*/
export function importWhenVisible<T extends BaseConstructor = BaseConstructor>(
  fn: () => Promise<T | { default: T }>,
  nameOrSelectorOrElement: string | HTMLElement | HTMLElement[],
  parent?: Base,
  observerOptions: IntersectionObserverInit = {},
): Promise<T> {
  const resolver = getComponentResolver(fn);

  return new Promise((resolve) => {
    const observer = new IntersectionObserver((entries) => {
      const someEntriesAreVisible = entries.some((entry) => entry.isIntersecting);
      if (someEntriesAreVisible) {
        setTimeout(() => {
          resolver(resolve, () => observer.disconnect());
        }, 0);
      }
    }, observerOptions);

    const elements = getTargetElements(nameOrSelectorOrElement, parent?.$el);
    for (const element of elements) observer.observe(element);
  });
}
