import { callMethod, getComponentElements } from './utils.js';
import ChildrenManager from './managers/ChildrenManager.js';
import RefsManager from './managers/RefsManager.js';
import ServicesManager from './managers/ServicesManager.js';
import EventsManager from './managers/EventsManager.js';
import OptionsManager from './managers/OptionsManager.js';

let id = 0;

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
 * @property {BaseConfigComponents} [components]
 * @property {BaseConfigOptions} [options]
 */

/**
 * Base class.
 */
export default class Base {
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
   * This is a Base instance.
   * @type {Boolean}
   * @readonly
   */
  static $isBase = true;

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

      proto = Object.getPrototypeOf(proto);
    }

    return config;
  }

  /**
   * @type {BaseConfig}
   */
  static config;

  /**
   * @type {ServicesManager}
   * @private
   */
  __services;

  /**
   * @type {ServicesManager}
   */
  get $services() {
    const services = this.__services;
    this.$emit('get:services', services);
    return services;
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
    const refs = this.__refs;
    this.$emit('get:refs', refs);
    return refs;
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
    const options = this.__options;
    this.$emit('get:options', options);
    return options;
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
    const children = this.__children;
    this.$emit('get:children', children);
    return children;
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
   * @return {(...args:any) => void}
   */
  get __debug() {
    return this.__options.debug && typeof window.__DEV__ !== 'undefined' && window.__DEV__
      ? window.console.log.bind(window, `[debug] [${this.$id}]`)
      : noop;
  }

  /**
   * Class constructor where all the magic takes place.
   *
   * @param {HTMLElement} element The component's root element dd.
   */
  constructor(element) {
    if (!element) {
      throw new Error('The root element must be defined.');
    }

    const { __config } = this;

    if (!__config) {
      throw new Error('The `config` static property must be defined.');
    }

    if (!__config.name) {
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

    this.__debug('constructor', this);

    return this;
  }

  /**
   * Trigger the `mounted` callback.
   * @return {this}
   */
  $mount() {
    this.__debug('$mount');

    this.$children.registerAll();
    this.$refs.registerAll();
    this.__events.bindRootElement();
    this.$services.enableAll();
    this.$children.mountAll();

    callMethod(this, 'mounted');
    this.$isMounted = true;
    return this;
  }

  /**
   * Update the instance children.
   * @return {this}
   */
  $update() {
    this.__debug('$update');

    // Undo
    this.$refs.unregisterAll();
    this.$services.disableAll();

    // Redo
    this.$children.registerAll();
    this.$refs.registerAll();
    this.$services.enableAll();

    // Update
    this.$children.updateAll();

    callMethod(this, 'updated');
    return this;
  }

  /**
   * Trigger the `destroyed` callback.
   * @return {this}
   */
  $destroy() {
    this.__debug('$destroy');

    this.__events.unbindRootElement();
    this.$refs.unregisterAll();
    this.$services.disableAll();
    this.$children.destroyAll();
    callMethod(this, 'destroyed');
    this.$isMounted = false;
    return this;
  }

  /**
   * Terminate a child instance when it is not needed anymore.
   * @return {void}
   */
  $terminate() {
    this.__debug('$terminate');

    // First, destroy the component.
    this.$destroy();

    // Execute the `terminated` hook if it exists
    callMethod(this, 'terminated');

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
    this.__debug('$on', event, listener, options);

    this.$el.addEventListener(event, listener, options);

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
    this.__debug('$off', event, listener);

    this.$el.removeEventListener(event, listener, options);
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
    this.__debug('$emit', event, args);
    this.$el.dispatchEvent(
      new CustomEvent(event, {
        detail: args,
      })
    );
  }
}
