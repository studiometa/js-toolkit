import Base from '../Base/index.js';

/**
 * @typedef {import('../Base/index.js').BaseConstructor} BaseConstructor
 * @typedef {import('../Base/index.js').BaseConfig} BaseConfig
 */

/**
 * Define a component without extending the Base class.
 *
 * @param {{ config: BaseConfig, [props:string]: unknown }} options
 *   The component's object
 * @return {BaseConstructor}
 *   A component's class.
 */
export default function defineComponent(options) {
  const { config, ...props } = options;

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

  Object.defineProperty(Component, 'name', { value: config.name });

  Object.keys(props).forEach((name) => {
    const descriptor = Object.getOwnPropertyDescriptor(props, name);
    Object.defineProperty(Component.prototype, name, descriptor);
  });

  return Component;
}
