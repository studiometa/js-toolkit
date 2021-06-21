import { pascalCase } from 'change-case';
import getAllProperties from '../../../utils/object/getAllProperties.js';
import EventsRefsManager from './EventsRefsManager.js';
import EventsChildrenManager from './EventsChildrenManager.js';

/**
 * @todo
 * - get all refs event methods, instantiate a new EventsRefsManager with it
 * - get all children event methods, instantiate a new EventsChildrenManager with it
 */

/**
 * Event to method management for the Base class.
 */
export default class Events {
  /**
   * @type {EventsRefsManager[]}
   */
  eventsRefsManagers = [];

  #base;

  /**
   * @type {EventsChildrenManager[]}
   */
  eventsChildrenManagers = [];

  /**
   * An array to store all the methods' name of the Base class.
   * @type {string[]}
   */
  get #eventMethods() {
    const regex = /^on.+$/;
    // @todo remove duplicates
    return getAllProperties(this.#base)
      .filter(([prop]) => regex.test(prop))
      .map(([prop]) => prop);
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
    const refs = Object.keys(this.#base.$refs).map((ref) => new RegExp(`^on${pascalCase(ref)}.+`));
    return this.#eventMethods.filter((method) => refs.some((ref) => ref.test(method)));
  }

  /**
   * An array to store all the methods' name to bind to child components.
   * @type {Array}
   */
  get #childrenEventMethods() {
    const children = Object.entries(this.#base.$children).map(([name, instances]) => ({
      regexp: new RegExp(`^on${pascalCase(name)}.+`),
      name,
      instances,
    }));
    return this.#eventMethods
      .map((method, index) => {
        if (children.some((child) => child.regexp.test(method))) {
          const handler = (...args) => {
            this.#base[method](...args, index);
          };

          return {
            method,
            index,
          };
        }

        return false;
      })
      .filter((value) => value);
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

  /**
   * Instantiate everything.
   */
  init() {
    this.eventsRefsManagers = [];
    this.eventsChildrenManagers = [];
  }

  /**
   * Bind all methods to their event and target.
   *
   * @return {void}
   */
  bindAll() {
    this.eventsRefsManagers.forEach((manager) => {
      manager.bindAll();
    });
    this.eventsChildrenManagers.forEach((manager) => {
      manager.bindAll();
    });
  }

  /**
   * Unbind all methods from their event and target.
   *
   * @return {void}
   */
  unbindAll() {
    this.eventsRefsManagers.forEach((manager) => {
      manager.unbindAll();
    });
    this.eventsChildrenManagers.forEach((manager) => {
      manager.unbindAll();
    });
  }

  /**
   * Bind an event definition.
   * @param {EventDefinition} eventDefinition
   */
  // bind(eventDefinition) {
  //   const { method, event, target, index } = eventDefinition;

  //   if (Array.isArray(target)) {
  //     target.forEach((t, i) => {
  //       this.bind({ method, event, target: t, index: i });
  //     });
  //     return;
  //   }

  //   const handler = function eventHandler(...args) {
  //     if (__DEV__) {
  //       debug(this.#base, method, event, target, ...args, index);
  //     }

  //     this.#base[method](...args, index);
  //   }.bind(this);

  //   if (target instanceof HTMLElement) {
  //     target.addEventListener(event, handler);

  //     const unbindMethod = () => {
  //       if (__DEV__) {
  //         debug(this.#base, 'unbinding event', method, event, target, index);
  //       }
  //       target.removeEventListener(event, handler);
  //     };
  //   } else if (target instanceof Promise) {
  //     target.then((t) => {
  //       t.$on(event, handler);
  //     });
  //     const unbindMethod = () => {
  //       if (__DEV__) {
  //         debug(this.#base, 'unbinding event', method, event, target, index);
  //       }
  //       target.then((t) => {
  //         t.off(event, handler);
  //       });
  //     };
  //   } else {
  //     target.$on(event, handler);
  //   }
  // }
}
