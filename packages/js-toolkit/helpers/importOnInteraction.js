import { getTargetElements } from './utils.js';

/**
 * @typedef {import('../Base/index.js').BaseConstructor} BaseConstructor
 * @typedef {import('../Base/index.js').default} Base
 */

/**
 * Import a component on an interaction.
 *
 * @template {BaseConstructor} T
 * @param {() => Promise<T|{default:T}>} fn
 *   The import function.
 * @param {string|HTMLElement|HTMLElement[]} nameOrSelectorOrElement
 *   The name or selector for the component.
 * @param {string|string[]} events
 *   The events to listen to to trigger the import.
 * @param {Base} [parent]
 *   The parent component.
 * @returns {Promise<T>}
 */
export default function importOnInteraction(fn, nameOrSelectorOrElement, events, parent) {
  const normalizedEvents = typeof events === 'string' ? [events] : events;

  let ResolvedClass;

  const resolver = (resolve) => {
    fn().then((module) => {
      ResolvedClass = 'default' in module ? module.default : module;
      resolve(ResolvedClass);
    });
  };

  return new Promise((resolve) => {
    const elements = getTargetElements(nameOrSelectorOrElement, parent?.$el);
    const eventListenerOptions = {
      capture: true,
      passive: true,
      once: true,
    };
    const handler = () => {
      resolver(resolve);
    };

    elements.forEach((element) => {
      normalizedEvents.forEach((event) => {
        element.addEventListener(event, handler, eventListenerOptions);
      });
    });
  });
}
