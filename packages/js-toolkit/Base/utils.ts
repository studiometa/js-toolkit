import { isArray, isDefined, isDev } from '../utils/index.js';
import type { Base, BaseConfig } from './index.js';

/**
 * Get a list of elements based on the name of a component.
 *
 * @param {string} nameOrSelector
 *   The name or selector to used for this component.
 * @param {HTMLElement|Document} element
 *   The root element on which to query the selector, defaults to `document`.
 * @returns {Array<HTMLElement>}
 *   A list of elements on which the component should be mounted.
 */
export function getComponentElements(nameOrSelector:string, element:HTMLElement | Document = document):HTMLElement[] {
  const selector = `[data-component="${nameOrSelector}"]`;
  let elements = [];

  try {
    elements = Array.from(element.querySelectorAll(selector));
    // eslint-disable-next-line no-empty
  } catch {}

  // If no child component found with the default selector, try a classic DOM selector
  if (elements.length === 0) {
    elements = Array.from(element.querySelectorAll(nameOrSelector));
  }

  return elements;
}

/**
 * Test if an event is defined in the given config.
 */
export function eventIsDefinedInConfig(event:string, config: BaseConfig):boolean {
  return isArray(config.emits) && config.emits.includes(event);
}

/**
 * Test if an event can be used on the given element.
 */
export function eventIsNative(event:string, element:HTMLElement):boolean {
  return isDefined(element[`on${event}`]);
}

/**
 * Get the target of a given event.
 * @todo Return false in v3 if event is not defined or not native to prevent adding a listener.
 */
export function getEventTarget(instance:Base, event:string, config:BaseConfig):Base | Base['$el'] {
  if (eventIsDefinedInConfig(event, config)) {
    return instance;
  }

  if (eventIsNative(event, instance.$el)) {
    return instance.$el;
  }

  if (isDev) {
    console.warn(
      `[${config.name}]`,
      `The "${event}" event is missing from the configuration and is not a native`,
      `event for the root element of type \`${instance.$el.constructor.name}\`.`,
    );
  }

  // @todo v3 return false or null
  return instance;
}
