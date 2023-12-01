import type { Base, BaseConstructor } from '../Base/index.js';
import { getTargetElements } from './utils.js';
import { isString, getComponentResolver } from '../utils/index.js';

/**
 * Import a component on an interaction.
 *
 * @template {BaseConstructor} [T=BaseConstructor]
 * @param {() => Promise<T|{default:T}>} fn
 *   The import function.
 * @param {string|HTMLElement|HTMLElement[]} nameOrSelectorOrElement
 *   The name or selector for the component.
 * @param {string|string[]} events
 *   The events to listen to to trigger the import.
 * @param {Base} [parent]
 *   The parent component.
 * @returns {Promise<InstanceType<T>>}
 */
export default function importOnInteraction<T extends BaseConstructor = BaseConstructor>(
  fn: () => Promise<T | { default: T }>,
  nameOrSelectorOrElement: string | HTMLElement | HTMLElement[],
  events: string | string[],
  parent?: Base,
): Promise<T> {
  const normalizedEvents = isString(events) ? [events] : events;

  const resolver = getComponentResolver(fn);

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

    for (const element of elements) {
      for (const event of normalizedEvents) {
        element.addEventListener(event, handler, eventListenerOptions);
      }
    }
  });
}
