import { getTargetElements } from './utils.js';

/**
 * @typedef {import('../Base/index.js').default} Base
 * @typedef {import('../Base/index.js').BaseConstructor} BaseConstructor
 */

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
 * @returns {Promise<T>}
 */
export default function importWhenVisible(
  fn,
  nameOrSelectorOrElement,
  parent,
  observerOptions = {}
) {
  let ResolvedClass;

  const resolver = (resolve, cb) => {
    fn().then((module) => {
      ResolvedClass = 'default' in module ? module.default : module;
      resolve(ResolvedClass);

      if (typeof cb === 'function') {
        cb();
      }
    });
  };

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
    elements.forEach((element) => observer.observe(element));
  });
}
