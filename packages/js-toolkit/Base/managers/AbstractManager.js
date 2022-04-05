/**
 * @typedef {import('../index.js').default} Base
 * @typedef {import('../index.js').BaseConfig} BaseConfig
 * @typedef {import('./EventsManager.js').default} EventsManager
 */

/**
 * AbstractManager class.
 */
export default class AbstractManager {
  /**
   * @type {Base}
   */
  __base;

  /**
   * Get the base instance root element.
   * @returns {HTMLElement}
   */
  get __element() {
    return this.__base.$el;
  }

  /**
   * Get the base instance config.
   * @returns {BaseConfig}
   */
  get __config() {
    // @ts-ignore
    return this.__base.__config;
  }

  /**
   * Get the events manager.
   * @returns {EventsManager}
   */
  get __eventsManager() {
    // @ts-ignore
    return this.__base.__events;
  }

  /**
   * Class constructor.
   *
   * @param   {Base} base
   */
  constructor(base) {
    this.__base = base;
    this.__hideProperties(['__base']);
  }

  /**
   * Prevent a list of properties from being enumerable and writable.
   * @param   {string[]} properties
   * @returns {void}
   */
  __hideProperties(properties) {
    Object.defineProperties(
      this,
      Object.fromEntries(
        properties.map((property) => [
          property,
          {
            enumerable: false,
            writable: false,
            value: this[property],
          },
        ])
      )
    );
  }
}
