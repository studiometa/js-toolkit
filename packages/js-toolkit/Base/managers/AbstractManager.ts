import type { Base } from '../index.js';

/**
 * AbstractManager class.
 */
export class AbstractManager {
  /**
   * Base instance.
   */
  __base: Base;

  /**
   * Get the base instance root element.
   */
  get __element() {
    return this.__base.$el;
  }

  /**
   * Get the base instance config.
   */
  get __config() {
    return this.__base.__config;
  }

  /**
   * Get the events manager.
   */
  get __eventsManager() {
    return this.__base.__events;
  }

  /**
   * Class constructor.
   */
  constructor(base: Base) {
    this.__base = base;
    this.__hideProperties(['__base']);
  }

  /**
   * Prevent a list of properties from being enumerable and writable.
   * @param   {string[]} properties
   * @returns {void}
   */
  __hideProperties(properties: string[]) {
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
        ]),
      ),
    );
  }
}
