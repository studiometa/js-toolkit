import { getComponentElements, getEventTarget } from './utils.js';
import ChildrenManager from './managers/ChildrenManager.js';
import RefsManager from './managers/RefsManager.js';
import ServicesManager from './managers/ServicesManager.js';
import EventsManager from './managers/EventsManager.js';
import OptionsManager from './managers/OptionsManager.js';
import { noop, isDev, isFunction, isArray } from '../utils/index.js';

let id = 0;

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
    if (isDev && !(instance[prop] instanceof constructor)) {
      throw new Error(
        `The \`$managers.${constructorName}\` must extend the \`${constructorName}\` class.`
      );
    }
  });
}

/**
 * @typedef {typeof Base} BaseConstructor
 * @typedef {(Base) => Promise<BaseConstructor | { default: BaseConstructor }>} BaseAsyncConstructor
 * @typedef {{ [name:string]: any }} BaseOptions
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
 * @typedef {{
 *   $el?: HTMLElement,
 *   $options?: BaseOptions,
 *   $refs?: BaseRefs,
 *   $children?: { [name:string]: Base | Promise<Base> },
 * }} BaseTypeParameter
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
 * @template {BaseTypeParameter} [BaseInterface={ $el: HTMLElement, $options: BaseOptions, $refs: BaseRefs, $children: { [name:string]: Base | Promise<Base> } }]
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
   * @type {BaseInterface['$el'] & HTMLElement & { __base__?: WeakMap<BaseConstructor, Base | 'terminated'> }}
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
      'before-mounted',
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
   */
  __services;

  /**
   * @type {ServicesManager}
   */
  get $services() {
    return this.__services;
  }

  /**
   * @type {RefsManager & BaseInterface['$refs'] & BaseRefs}
   */
  __refs;

  /**
   * @returns {RefsManager & BaseInterface['$refs'] & BaseRefs}
   */
  get $refs() {
    return this.__refs;
  }

  /**
   * @type {OptionsManager & BaseInterface['$options'] & BaseOptions}
   */
  __options;

  /**
   * @returns {OptionsManager & BaseInterface['$options'] & BaseOptions}
   */
  get $options() {
    return this.__options;
  }

  /**
   * @type {ChildrenManager & { [key in keyof BaseInterface['$children']]: Array<BaseInterface['$children'][key]> } & BaseChildren}
   */
  __children;

  /**
   * @returns {ChildrenManager & { [key in keyof BaseInterface['$children']]: Array<BaseInterface['$children'][key]> } & BaseChildren}
   */
  get $children() {
    return this.__children;
  }

  /**
   * @type {EventsManager}
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
   * @param {string} method
   * @param {any[]} args
   * @returns {any}
   */
  __callMethod(method, ...args) {
    if (isDev) {
      this.__debug('callMethod', method, ...args);
    }

    this.$emit(method, ...args);

    // We always emit an event, but we do not call the method if it does not exist
    if (!isFunction(this[method])) {
      return null;
    }

    if (isDev) {
      this.__debug(method, this, ...args);
    }

    return this[method].call(this, ...args);
  }

  /**
   * Test if the given event has been bound to the instance.
   *
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
      if (isDev) {
        throw new Error('The root element must be defined.');
      }
      return;
    }

    const { __config } = this;

    if (__config.name === 'Base') {
      if (isDev) {
        throw new Error('The `config.name` property is required.');
      }
      return;
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

    this.$emit('before-mounted');

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
   * Add an emitted event.
   *
   * @param   {string} event The event name.
   * @returns {void}
   */
  __addEmits(event) {
    const ctor = this.__ctor;
    if (isArray(ctor.config.emits)) {
      ctor.config.emits.push(event);
    } else {
      ctor.config.emits = [event];
    }
  }

  /**
   * Remove an emitted event.
   *
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

    let set = this.__eventHandlers.get(event);

    if (!set) {
      set = new Set();
      this.__eventHandlers.set(event, set);
    }

    set.add(listener);

    const target = getEventTarget(this, event, this.__config);
    target.addEventListener(event, listener, options);

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

    this.__eventHandlers.get(event).delete(listener);

    const target = getEventTarget(this, event, this.__config);
    target.removeEventListener(event, listener, options);
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

    this.dispatchEvent(new CustomEvent(event, { detail: args }));
  }

  /**
   * Factory method to generate multiple instance of the class.
   *
   * @param  {string}      nameOrSelector The selector on which to mount each instance.
   * @returns {Array<Base>}                A list of the created instance.
   */
  static $factory(nameOrSelector) {
    if (isDev && !nameOrSelector) {
      throw new Error(
        'The $factory method requires a component’s name or selector to be specified.'
      );
    }

    return getComponentElements(nameOrSelector).map((el) => new this(el).$mount());
  }
}
