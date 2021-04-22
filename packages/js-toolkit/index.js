import Base from './abstracts/Base/index.js';

/**
 * @typedef {import('./abstracts/Base').BaseComponent} BaseComponent
 */

/**
 * Define a component without a class.
 *
 * @param  {Object} options The component's object
 * @return {BaseComponent}           A component's class.
 */
export function defineComponent(options) {
  const { config, methods, ...hooks } = options;

  if (!config) {
    throw new Error('The `config` property is required.');
  }

  if (!config.name) {
    throw new Error('The `config.name` property is required.');
  }

  /**
   * Component class.
   */
  class Component extends Base {
    /**
     * Component config.
     */
    static config = config;
  }

  const allowedHooks = [
    'mounted',
    'loaded',
    'ticked',
    'resized',
    'moved',
    'keyed',
    'scrolled',
    'destroyed',
    'terminated',
  ];

  const filteredHooks = Object.entries(hooks).reduce((acc, [name, fn]) => {
    if (allowedHooks.includes(name)) {
      acc[name] = fn;
    } else {
      throw new Error(
        `
          The "${name}" method is not a Base lifecycle hook,
          it should be placed in the "method" property.
          The following hooks are available: ${allowedHooks.join(', ')}
        `
      );
    }

    return acc;
  }, {});

  [...Object.entries(methods || {}), ...Object.entries(filteredHooks)].forEach(([name, fn]) => {
    Component.prototype[name] = fn;
  });

  return Component;
}

/**
 * Create a Base instance with the given object configuration.
 * @param {HTMLElement|String} elementOrSelector The instance root HTML element.
 * @param {Object}             options           The Base class configuration.
 */
export function createBase(elementOrSelector, options) {
  const Component = defineComponent(options);
  /** @type {HTMLElement} */
  const element =
    typeof elementOrSelector === 'string'
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;
  return new Component(element);
}

export default Base;
