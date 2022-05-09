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
 * @returns {void}
 */
function noop() {}

/**
 * Test if the managers' instances implement the default manager.
 *
 * @throws
 * @param   {Base} instance The instance to test.
 * @returns {void}
 */
function createAndTestManagers(instance) {
  [
    {
      prop: '__options',
      constructorName: 'OptionsManager',
      constructor: OptionsManager,
    },
    {
      prop: '__services',
      constructorName: 'ServicesManager',
      constructor: ServicesManager,
    },
    {
      prop: '__events',
      constructorName: 'EventsManager',
      constructor: EventsManager,
    },
    {
      prop: '__refs',
      constructorName: 'RefsManager',
      constructor: RefsManager,
    },
    {
      prop: '__children',
      constructorName: 'ChildrenManager',
      constructor: ChildrenManager,
    },
  ].forEach(({ prop, constructorName, constructor }) => {
    instance[prop] = new instance.__managers[constructorName](instance);
    if (!(instance[prop] instanceof constructor)) {
      throw new Error(
        `The \`$managers.${constructorName}\` must extend the \`${constructorName}\` class.`
      );
    }
  });
}

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
 * @property {string} name
 * @property {boolean} [debug]
 * @property {boolean} [log]
 * @property {string[]} [refs]
 * @property {string[]} [emits]
 * @property {BaseConfigComponents} [components]
 * @property {BaseConfigOptions} [options]
 */

/**
 * @typedef {Object} Managers
 * @property {typeof ChildrenManager} ChildrenManager
 * @property {typeof EventsManager} EventsManager
 * @property {typeof OptionsManager} OptionsManager
 * @property {typeof RefsManager} RefsManager
 * @property {typeof ServicesManager} ServicesManager
 */

/**
 * Base class.
 */
export default class Base extends EventTarget {
  /**
   * This is a Base instance.
   * @type {boolean}
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
   * @type {HTMLElement & { __base__?: WeakMap<BaseConstructor, Base | 'terminated'> }}
   */
  $el;

  /**
   * The state of the component.
   * @type {boolean}
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
   * @returns {Base}
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
   * @returns {BaseConfig}
   * @private
   */
  get __config() {
    let proto = Object.getPrototypeOf(this);
    let { config } = proto.constructor;

    while (proto.constructor.config && proto.constructor.$isBase) {
      config = { ...proto.constructor.config, ...config };

      if (proto.constructor.config.options) {
        config.options = { ...proto.constructor.config.options, ...config.options };
      }

      if (proto.constructor.config.emits && config.emits) {
        config.emits = [...proto.constructor.config.emits, ...config.emits];
      }

      proto = Object.getPrototypeOf(proto);
    }

    config.options = config.options ?? {};
    config.refs = config.refs ?? [];
    config.components = config.components ?? {};

    return config;
  }

  /**
   * @type {BaseConfig}
   */
  static config = {
    name: 'Base',
    emits: [
      // hook events
      'mounted',
      'updated',
      'destroyed',
      'terminated',
      // default services' events
      'ticked',
      'scrolled',
      'resized',
      'moved',
      'loaded',
      'keyed',
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
   * @returns {RefsManager}
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
   * @returns {BaseOptions}
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
   * @returns {ChildrenManager}
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
   * @returns {(...args: any) => void}
   */
  get $log() {
    return this.__options.log ? window.console.log.bind(window, `[${this.__config.name}]`) : noop;
  }

  /**
   * Small helper to debug information.
   *
   * @private
   * @returns {(...args:any) => void}
   */
  get __debug() {
    return isDev && this.__options.debug
      ? window.console.log.bind(window, `[debug] [${this.$id}]`)
      : noop;
  }

  /**
   * Get manager constructors.
   *
   * @returns {Managers}
   */
  get __managers() {
    return {
      ChildrenManager,
      EventsManager,
      OptionsManager,
      RefsManager,
      ServicesManager,
    };
  }

  /**
   * Call an instance method and emit corresponding events.
   *
   * @private
   * @param {string} method
   * @param {any[]} args
   * @returns {void}
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
   * @returns {boolean}      Wether the given event has been bound or not.
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

    if (!this.$el.__base__) {
      this.$el.__base__ = new WeakMap();
    }

    this.$el.__base__.set(this.__ctor, this);

    createAndTestManagers(this);

    if (isDev) {
      this.__debug('constructor', this);
    }
  }

  /**
   * Trigger the `mounted` callback.
   * @returns {this}
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
   * @returns {this}
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
   * @returns {this}
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
   * @returns {void}
   */
  $terminate() {
    if (isDev) {
      this.__debug('$terminate');
    }

    // First, destroy the component.
    this.$destroy();

    // Execute the `terminated` hook if it exists
    this.__callMethod('terminated');

    // Delete instance
    this.$el.__base__.set(this.__ctor, 'terminated');
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
    const ctor = this.__ctor;
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
    const ctor = this.__ctor;
    const index = ctor.config.emits.indexOf(event);
    ctor.config.emits.splice(index, 1);
  }

  /**
   * Get the instance constructor.
   *
   * @private
   * @returns {BaseConstructor}
   */
  get __ctor() {
    return /** @type {BaseConstructor} */ (this.constructor);
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
   * @returns {() => void}
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
   * @returns {void}
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
   * @returns {void}
   */
  $emit(event, ...args) {
    if (isDev) {
      this.__debug('$emit', event, args);
    }

    if (isDev) {
      this.__testEventIsDefined(event);
    }

    this.dispatchEvent(new CustomEvent(event, { detail: args }));
  }

  /**
   * Factory method to generate multiple instance of the class.
   *
   * @param  {string}      nameOrSelector The selector on which to mount each instance.
   * @returns {Array<Base>}                A list of the created instance.
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
