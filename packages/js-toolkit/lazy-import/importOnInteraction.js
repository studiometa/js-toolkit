import { getComponentElements } from '../abstracts/Base/utils.js';

/**
 * @typedef {import('../abstracts/Base/index.js').default} Base
 */

/**
 * Import a component on an interaction.
 *
 * @param {() => Promise<Base>} fn
 *   The import function.
 * @param {string} nameOrSelector
 *   The name or selector for the component.
 * @param {string|string[]} events
 *   The events to listen to to trigger the import.
 * @param {typeof Base=} [parent]
 *   The parent component.
 *
 * @return {Promise<Base>}
 */
export default function importOnInteraction(fn, nameOrSelector, events, parent) {
  // eslint-disable-next-line no-param-reassign
  events = Array.isArray(events) ? events : [events];

  return new Promise((resolve) => {
    const elements = getComponentElements(nameOrSelector, parent?.$el);
    const eventListenerOptions = {
      capture: true,
      passive: true,
      once: true,
    };
    const handler = () => {
      fn().then(resolve);
    };

    elements.forEach((element) => {
      events.forEach((event) => {
        element.addEventListener(event, handler, eventListenerOptions);
      });
    });
  });
}
