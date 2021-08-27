/**
 * @typedef {import('./index.js').default} Base
 * @typedef {import('./index.js').BaseConfig} BaseConfig
 */

/**
 * Get the config from a Base instance, either the new static one or the old getter one.
 *
 * @param  {Base}       instance The instance to get the config from.
 * @return {BaseConfig}         A Base class configuration object.
 */
export function getConfig(instance) {
  // @ts-ignore
  const config = instance.constructor.config || instance.config;

  if (!config) {
    throw new Error('The `config` property must be defined.');
  }

  if (!config.name) {
    throw new Error('The `config.name` property is required.');
  }

  // @ts-ignore
  if (instance.config && !instance.constructor.config) {
    console.warn(
      `[${config.name}]`,
      'Defining the `config` as a getter is deprecated, replace it with a static property.'
    );
  }

  return config;
}

/**
 * Display a console warning for the given instance.
 *
 * @param {Base}      instance A Base instance.
 * @param {...String} msg   Values to display in the console.
 */
export function warn(instance, ...msg) {
  const { name } = getConfig(instance);
  console.warn(`[${name}]`, ...msg);
}

/**
 * Display a console log for the given instance.
 *
 * @param {Base}   instance The instance to log information from.
 * @param {...any} msg      The data to print to the console.
 */
export function log(instance, ...msg) {
  const { name } = getConfig(instance);
  console.log(`[${name}]`, ...msg);
}

/**
 * Verbose debug for the component.
 *
 * @param {Base}   instance The instance to debug.
 * @param {...any} args     The data to print.
 */
export function debug(instance, ...args) {
  if (instance.$options.debug) {
    log(instance, '[debug]', ...args);
  }
}

/**
 * Test if an object has a method.
 *
 * @param  {Object}  obj  The object to test
 * @param  {String}  name The method's name
 * @return {Boolean}
 */
export function hasMethod(obj, name) {
  return typeof obj[name] === 'function';
}

/**
 * Call the given method while applying the given arguments.
 *
 * @param {Base}   instance The Base instance on which to trigger the method.
 * @param {String} method   The method to call.
 * @param {...any} args     The arguments to pass to the method.
 */
export function callMethod(instance, method, ...args) {
  if (__DEV__) {
    debug(instance, 'callMethod', method, ...args);
  }

  // Prevent duplicate call of `mounted` and `destroyed`
  // methods based on the component status
  if (
    (method === 'destroyed' && !instance.$isMounted) ||
    (method === 'mounted' && instance.$isMounted)
  ) {
    if (__DEV__) {
      debug(instance, 'not', method, 'because the method has already been triggered once.');
    }
    return instance;
  }

  instance.$emit(method, ...args);

  // We always emit an event, but we do not call the method if it does not exist
  if (!hasMethod(instance, method)) {
    return instance;
  }

  instance[method].call(instance, ...args);
  if (__DEV__) {
    debug(instance, method, instance, ...args);
  }

  return instance;
}

/**
 * Get a list of elements based on the name of a component.
 *
 * @param {String} nameOrSelector
 *   The name or selector to used for this component.
 * @param {HTMLElement|Document} element
 *   The root element on which to query the selector, defaults to `document`.
 * @return {Array<HTMLElement>}
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
