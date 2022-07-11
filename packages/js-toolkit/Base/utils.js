import { isArray, isDefined, isDev } from '../utils/index.js';

/**
 * @typedef {import('./index.js').default} Base
 */

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
export function getComponentElements(nameOrSelector, element = document) {
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
 *
 * @param   {string} event
 * @param   {import('./index.js').BaseConfig} config
 * @returns {boolean}
 */
export function eventIsDefinedInConfig(event, config) {
  return isArray(config.emits) && config.emits.includes(event);
}

/**
 * Test if an event can be used on the given element.
 *
 * @param   {string} event
 * @param   {HTMLElement} element
 * @returns {boolean}
 */
export function eventIsNative(event, element) {
  return isDefined(element[`on${event}`]);
}

/**
 * Get the target of a given event.
 *
 * @param   {Base} instance
 * @param   {string} event
 * @param   {import('./index.js').BaseConfig} config
 * @returns {Base|Base['$el']}
 */
export function getEventTarget(instance, event, config) {
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
      `event for the root element of type \`${instance.$el.constructor.name}\`.`
    );
  }

  return instance;
}
