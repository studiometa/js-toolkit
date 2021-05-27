import { pascalCase } from 'change-case';

/**
 * @typedef {import('./index.js').default} Base
 * @typedef {import('./index.js').BaseComponent} BaseComponent
 * @typedef {import('./index.js').BaseAsyncComponent} BaseAsyncComponent
 */

/**
 * @typedef {HTMLElement | HTMLElement[] | BaseComponent | BaseComponent[] | BaseAsyncComponent | BaseAsyncComponent[]} EventTarget
 */

/**
 * @typedef {Object} EventDefinition
 * @property {Function} method The method's handler.
 * @property {EventTarget} target The target on which to bind the event.
 * @property {string} event The name of the event.
 */

/**
 * Event to method management for the Base class.
 */
export default class Events {
  /** @type {Base} */
  #base;

  /**
   * An array to store all the methods' name of the Base class.
   * @type {string[]}
   */
  get #eventMethods() {
    const regex = /^on.+$/;
    return getAllProperties(this.#base).filter((prop) => regex.test(prop));
  }

  /**
   * An array to store all the methods' name to bind to the root element.
   * @type {string[]}
   */
  #rootEventMethods;

  /**
   * An array to store all the methods' name to bind to refs elements.
   * @type {string[]}
   */
  get #refsEventMethods() {
    const refs = Object.keys(this.$refs).map((ref) => new RegExp(`^on${pascalCase(ref)}.+`));
    return this.#eventMethods.filter((method) => refs.some((ref) => ref.test(method)));
  }

  /**
   * An array to store all the methods' name to bind to child components.
   * @type {string[]}
   */
  get #childrenEventMethods() {
    const children = Object.keys(this.$children).map(
      (child) => new RegExp(`^on${pascalCase(child)}.+`)
    );
    return this.#eventMethods
      .filter((method) => children.some((child) => child.test(method)))
      .map((method) => {
        return {
          method,
          event: '',
          target: '',
        };
      });
  }

  /**
   * Class constructor.
   * @param {Base} instance The Base instance.
   */
  constructor(instance) {
    this.#base = instance;

    this.definitions = [];

    // get methods beginning with `on`
    // loop over them, create EventDefinition objects with method, event and target
    //
  }

  getDefinitions() {

    return [];
  }

  /**
   * Bind all methods to their event and target.
   * @return {void}
   */
  bindAll() {
    this.definitions.forEach((definition) => {
      this.bind(definition);
    });
  }

  /**
   * Bind an event definition.
   * @param {EventDefinition} eventDefinition
   */
  bind(eventDefinition) {
    const { method, event, target, index } = eventDefinition;

    if (Array.isArray(target)) {
      target.forEach((t, index) => {
        this.bind({ method, event, target: t, index });
      });
      return;
    }

    const handler = function eventHandler(...args) {
      if (__DEV__) {
        debug(this.#base, method, event, target, ...args, index);
      }

      this.#base[method](...args, index);
    };

    if (target instanceof HTMLElement) {
      target.addEventListener(event, handler);

      const unbindMethod = () => {
        if (__DEV__) {
          debug(this.#base, 'unbinding event', method, event, target, index);
        }
        target.removeEventListener(event, handler);
      };
    } else if (target instanceof Promise) {
      target.then((t) => {
        t.$on(event, handler);
      });
      const unbindMethod = () => {
        if (__DEV__) {
          debug(this.#base, 'unbinding event', method, event, target, index);
        }
        target.then((t) => {
          t.off(event, handler);
        });
      };
    } else {
      target.$on(event, handler);
    }
  }

  /**
   * Unbind all methods from their event and target.
   * @return {void}
   */
  unbindAll() {
    this.definitions.forEach((definition) => {
      this.unbind(definition);
    });
  }

  /**
   * Unbind an event definition.
   * @param {EventDefinition} eventDefinition
   */
  unbind(eventDefinition) {

  }
}
