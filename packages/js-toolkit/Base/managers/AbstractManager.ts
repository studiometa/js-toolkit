import type { Base } from '../index.js';

/**
 * AbstractManager class.
 */
export class AbstractManager<T extends any = any> {
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

  __props: T = {} as any;

  get props() {
    return this.__props;
  }

  /**
   * Class constructor.
   */
  constructor(base: Base) {
    this.__base = base;
  }
}
