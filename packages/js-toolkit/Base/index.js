import { getComponentElements } from './utils.js';
import ChildrenManager from './managers/ChildrenManager.js';
import RefsManager from './managers/RefsManager.js';
import ServicesManager from './managers/ServicesManager.js';
import EventsManager from './managers/EventsManager.js';
import OptionsManager from './managers/OptionsManager.js';

let id = 0;

// eslint-disable-next-line no-undef
const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

/**
 * No operation function.
 * @return {void}
 */
function noop() {}

/**
 * @typedef {typeof Base} BaseConstructor
 * @typedef {(Base) => Promise<BaseConstructor | { default: BaseConstructor }>} BaseAsyncConstructor
 * @typedef {OptionsManager & { [name:string]: any }} BaseOptions
 * @typedef {{ [name:string]: HTMLElement | HTMLElement[] }} BaseRefs
 * @typedef {{ [nameOrSelector:string]: Base[] | Promise<Base>[] }} BaseChildren
 * @typedef {{ [nameOrSelector:string]: BaseConstructor | BaseAsyncConstructor }} BaseConfigComponents
 * @typedef {import('./managers/OptionsManager').OptionsSchema} BaseConfigOptions
 * @typedef {import('./managers/ServicesManager.js').ServiceName} ServiceName
 */

/**
 * @typedef {Object} BaseConfig
 * @property {String} name
 * @property {Boolean} [debug]
 * @property {Boolean} [log]
 * @property {String[]} [refs]
 * @property {String[]} [emits]
 * @property {BaseConfigComponents} [components]
 * @property {BaseConfigOptions} [options]
 */

/**
 * Base class.
 */
export default class Base extends EventTarget {
  /**
   * This is a Base instance.
   * @type {Boolean}
   * @readonly
   */
  static $isBase = true;

  /**
   * The instance parent.
   * @type {Base}
   */
  $parent = null;

  /**
   * The instance id.
   * @type {string}
   */
  $id;

  /**
   * The root element.
   * @type {HTMLElement}
   */
  $el;

  /**
   * The state of the component.
   * @type {Boolean}
   */
  $isMounted = false;

  /**
   * Store the event handlers.
   *
   * @private
   * @type {Map<string, Set<EventListenerOrEventListenerObject>>}
   */
  __eventHandlers = new Map();

  /**
   * Get the root instance of the app.
   * @return {Base}
   */
  get $root() {
    if (!this.$parent) {
      return this;
    }

    let parent = this.$parent;
    let root = this.$parent;

    while (parent) {
      if (!parent.$parent) {
        root = parent;
      }

      parent = parent.$parent;
    }

    return root;
  }

  /**
   * Merge configuration with the parents' configurations.
   *
   * @return {BaseConfig}
   * @private
   */
  get __config() {
    let proto = Object.getPrototypeOf(this);
    let { config } = proto.constructor;

    while (proto.constructor.config && proto.constructor.$isBase) {
      config = {
        ...proto.constructor.config,
        ...config,
      };

      if (proto.constructor.config.options) {
        config.options = {
          ...proto.constructor.config.options,
          ...config.options,
        };
      }

      if (proto.constructor.config.emits && config.emits) {
        config.emits = [...proto.constructor.config.emits, ...config.emits];
      }

      proto = Object.getPrototypeOf(proto);
    }

    return config;
  }

  /**
   * @type {BaseConfig}
   */
  static config = {
    name: 'Base',
    emits: [
      'mounted',
      'updated',
      'destroyed',
      'terminated',
      'ticked',
      'scrolled',
      'resized',
      'moved',
      'loaded',
    ],
  };

  /**
   * @type {ServicesManager}
   * @private
   */
  __services;

  /**
   * @type {ServicesManager}
   */
  get $services() {
    return this.__services;
  }

  /**
   * @type {RefsManager}
   * @private
   */
  __refs;

  /**
   * @return {RefsManager}
   */
  get $refs() {
    return this.__refs;
  }

  /**
   * @type {BaseOptions}
   * @private
   */
  __options;

  /**
   * @return {BaseOptions}
   */
  get $options() {
    return this.__options;
  }

  /**
   * @type {ChildrenManager}
   * @private
   */
  __children;

  /**
   * @return {ChildrenManager}
   */
  get $children() {
    return this.__children;
  }

  /**
   * @type {EventsManager}
   * @private
   */
  __events;

  /**
   * Small helper to log stuff.
   *
   * @return {(...args: any) => void}
   */
  get $log() {
    return this.__options.log ? window.console.log.bind(window, `[${this.__config.name}]`) : noop;
  }

  /**
   * Small helper to debug information.
   *
   * @private
   * @return {(...args:any) => void}
   */
  get __debug() {
    return isDev && this.__options.debug
      ? window.console.log.bind(window, `[debug] [${this.$id}]`)
      : noop;
  }

  /**
   * Call an instance method and emit corresponding events.
   *
   * @private
   * @param {string} method
   * @param {any[]} args
   * @return {void}
   */
  __callMethod(method, ...args) {
    if (isDev) {
      this.__debug('callMethod', method, ...args);
    }

    this.$emit(method, ...args);

    // We always emit an event, but we do not call the method if it does not exist
    if (typeof this[method] !== 'function') {
      return;
    }

    this[method].call(this, ...args);
    if (isDev) {
      this.__debug(method, this, ...args);
    }
  }

  /**
   * Test if the given event has been bound to the instance.
   *
   * @private
   * @param  {string} event The event's name.
   * @return {boolean}      Wether the given event has been bound or not.
   */
  __hasEvent(event) {
    const eventHandlers = this.__eventHandlers.get(event);
    return eventHandlers && eventHandlers.size > 0;
  }

  /**
   * Class constructor where all the magic takes place.
   *
   * @param {HTMLElement} element The component's root element dd.
   */
  constructor(element) {
    super();

    if (!element) {
      throw new Error('The root element must be defined.');
    }

    const { __config } = this;

    if (__config.name === 'Base') {
      throw new Error('The `config.name` property is required.');
    }

    this.$id = `${__config.name}-${id}`;
    id += 1;

    this.$el = element;

    if (!('__base__' in this.$el)) {
      Object.defineProperty(this.$el, '__base__', {
        get: () => this,
        configurable: true,
      });
    }

    this.__options = new OptionsManager(element, __config.options || {}, __config);
    this.__services = new ServicesManager(this);
    this.__events = new EventsManager(element, this);
    this.__children = new ChildrenManager(this, element, __config.components || {}, this.__events);
    this.__refs = new RefsManager(this, element, __config.refs || [], this.__events);

    if (isDev) {
      this.__debug('constructor', this);
    }

    return this;
  }

  /**
   * Trigger the `mounted` callback.
   * @return {this}
   */
  $mount() {
    if (this.$isMounted) {
      return this;
    }

    this.$isMounted = true;
    if (isDev) {
      this.__debug('$mount');
    }
    this.$children.registerAll();
    this.$refs.registerAll();
    this.__events.bindRootElement();
    this.$services.enableAll();
    this.$children.mountAll();

    this.__callMethod('mounted');

    return this;
  }

  /**
   * Update the instance children.
   * @return {this}
   */
  $update() {
    if (isDev) {
      this.__debug('$update');
    }

    // Undo
    this.$refs.unregisterAll();
    this.$services.disableAll();

    // Redo
    this.$children.registerAll();
    this.$refs.registerAll();
    this.$services.enableAll();

    // Update
    this.$children.updateAll();

    this.__callMethod('updated');
    return this;
  }

  /**
   * Trigger the `destroyed` callback.
   * @return {this}
   */
  $destroy() {
    if (!this.$isMounted) {
      return this;
    }

    this.$isMounted = false;
    if (isDev) {
      this.__debug('$destroy');
    }
    this.__events.unbindRootElement();
    this.$refs.unregisterAll();
    this.$services.disableAll();
    this.$children.destroyAll();
    this.__callMethod('destroyed');

    return this;
  }

  /**
   * Terminate a child instance when it is not needed anymore.
   * @return {void}
   */
  $terminate() {
    if (isDev) {
      this.__debug('$terminate');
    }

    // First, destroy the component.
    this.$destroy();

    // Execute the `terminated` hook if it exists
    this.__callMethod('terminated');

    // Delete the reference to the instance
    // delete this.$el.__base__;

    // And update its status to prevent re-instantiation when accessing the
    // parent's `$children` property
    Object.defineProperty(this.$el, '__base__', {
      value: 'terminated',
      configurable: false,
      writable: false,
    });
  }

  /**
   * Test if the given event is configured and warn otherwise.
   *
   * @private
   * @param   {string} event The event name.
   * @returns {void}
   */
  __testEventIsDefined(event) {
    if (!(Array.isArray(this.__config.emits) && this.__config.emits.includes(event))) {
      console.warn(
        `[${this.__config.name}]`,
        `The "${event}" event is missing from the configuration.`
      );
    }
  }

  /**
   * Add an emitted event.
   *
   * @private
   * @param   {string} event The event name.
   * @returns {void}
   */
  __addEmits(event) {
    const ctor = /** @type {BaseConstructor} */ (this.constructor);
    if (Array.isArray(ctor.config.emits)) {
      ctor.config.emits.push(event);
    } else {
      ctor.config.emits = [event];
    }
  }

  /**
   * Remove an emitted event.
   *
   * @private
   * @param   {string} event The event name.
   * @returns {void}
   */
  __removeEmits(event) {
    const ctor = /** @type {BaseConstructor} */ (this.constructor);
    const index = ctor.config.emits.findIndex((value) => value === event);
    ctor.config.emits.splice(index, 1);
  }

  /**
   * Bind a listener function to an event.
   *
   * @param  {string} event
   *   Name of the event.
   * @param  {EventListenerOrEventListenerObject} listener
   *   Function to be called.
   * @param {boolean|AddEventListenerOptions} [options]
   *   Options for the `removeEventListener` method.
   * @return {() => void}
   *   A function to unbind the listener.
   */
  $on(event, listener, options) {
    if (isDev) {
      this.__debug('$on', event, listener, options);
    }

    if (isDev) {
      this.__testEventIsDefined(event);
    }

    let set = this.__eventHandlers.get(event);

    if (!set) {
      set = new Set();
      this.__eventHandlers.set(event, set);
    }

    set.add(listener);
    this.addEventListener(event, listener, options);

    return () => {
      this.$off(event, listener, options);
    };
  }

  /**
   * Unbind a listener function from an event.
   *
   * @param {string} event
   *   Name of the event.
   * @param {EventListenerOrEventListenerObject} listener
   *   Function to be removed.
   * @param {boolean|EventListenerOptions} [options]
   *   Options for the `removeEventListener` method.
   *
   * @return {void}
   */
  $off(event, listener, options) {
    if (isDev) {
      this.__debug('$off', event, listener);
    }

    if (isDev) {
      this.__testEventIsDefined(event);
    }

    this.__eventHandlers.get(event).delete(listener);
    this.removeEventListener(event, listener, options);
  }

  /**
   * Emits an event.
   *
   * @param  {string} event
   *   Name of the event.
   * @param  {any[]}        args  The arguments to apply to the functions bound to this event.
   * @return {void}
   */
  $emit(event, ...args) {
    if (isDev) {
      this.__debug('$emit', event, args);
    }

    if (isDev) {
      this.__testEventIsDefined(event);
    }

    this.dispatchEvent(
      new CustomEvent(event, {
        detail: args,
      })
    );
  }

  /**
   * Factory method to generate multiple instance of the class.
   *
   * @param  {String}      nameOrSelector The selector on which to mount each instance.
   * @return {Array<Base>}                A list of the created instance.
   */
  static $factory(nameOrSelector) {
    if (!nameOrSelector) {
      throw new Error(
        'The $factory method requires a component’s name or selector to be specified.'
      );
    }

    return getComponentElements(nameOrSelector).map((el) => new this(el).$mount());
  }
}
