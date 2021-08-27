import { getTargetElements } from './utils.js';

/**
 * @typedef {import('../abstracts/Base/index.js').default} Base
 */

/**
 * Import a component on an interaction.
 *
 * @param {() => Promise<Base>} fn
 *   The import function.
 * @param {string|HTMLElement|HTMLElement[]} nameOrSelectorOrElement
 *   The name or selector for the component.
 * @param {string|string[]} events
 *   The events to listen to to trigger the import.
 * @param {Base=} [parent]
 *   The parent component.
 *
 * @return {Promise<Base>}
 */
export default function importOnInteraction(fn, nameOrSelectorOrElement, events, parent) {
  const normalizedEvents = typeof events === 'string' ? [events] : events;

  return new Promise((resolve) => {
    const elements = getTargetElements(nameOrSelectorOrElement, parent?.$el);
    const eventListenerOptions = {
      capture: true,
      passive: true,
      once: true,
    };
    const handler = () => {
      fn().then(resolve);
    };

    elements.forEach((element) => {
      normalizedEvents.forEach((event) => {
        element.addEventListener(event, handler, eventListenerOptions);
      });
    });
  });
}
