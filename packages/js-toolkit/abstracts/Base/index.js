import autoBind from '../../utils/object/autoBind.js';
import EventManager from '../EventManager.js';
import { callMethod, debug, getConfig, getComponentElements } from './utils.js';
import { getChildren } from './children.js';
import { getOptions } from './options.js';
import { getRefs } from './refs.js';
import { mountComponents, mountOrUpdateComponents, destroyComponents } from './components.js';
import Services from './classes/Services.js';
import bindEvents from './events.js';

// Define the __DEV__ constant if not defined
if (typeof __DEV__ === 'undefined') {
  if (typeof globalThis !== 'undefined') {
    globalThis.__DEV__ = false;
  } else if (typeof window !== 'undefined') {
    window.__DEV__ = false;
  }
}

let id = 0;

/**
 * @typedef {typeof Base} BaseComponent
 * @typedef {(Base) => Promise<BaseComponent | { default: BaseComponent }>} BaseAsyncComponent
 * @typedef {{ name: string, debug: boolean, log: boolean, [name:string]: any }} BaseOptions
 * @typedef {{ [name:string]: HTMLElement | HTMLElement[] | Base | Base[] | Promise<Base> | Promise<Base>[] }} BaseRefs
 * @typedef {{ [nameOrSelector:string]: Base[] | Promise<Base>[] }} BaseChildren
 * @typedef {{ [nameOrSelector:string]: BaseComponent | BaseAsyncComponent }} BaseConfigComponents
 * @typedef {import('./classes/Options').OptionsSchema} BaseConfigOptions
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
 * @typedef {import('./classes/Services.js').ServiceName} ServiceName
 */

/**
 * Base class to easily create components.
 *
 * @example
 * ```js
 * class Component extends Base {
 *   static config = {
 *     name: 'Component',
 *     log: true,
 *   };
 *
 *   mounted() {
 *     this.$log('Component is mounted!');
 *   }
 * }
 *
 * class App extends Base {
 *   static config = {
 *     name: 'App',
 *     components: {
 *       Component,
 *     },
 *   };
 * }
 *
 * new App(document.body).$mount();
 * ```
 */
export default class Base extends EventManager {
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
   * The instance options.
   * @type {BaseOptions}
   */
  $options;

  /**
   * The instance children components.
   * @type {BaseChildren}
   */
  $children;

  /**
   * The instance services.
   * @type {Services}
   */
  $services;

  /**
   * The state of the component.
   * @type {Boolean}
   */
  $isMounted = false;

  /**
   * This is a Base instance.
   * @type {Boolean}
   */
  static $isBase = true;

  /**
   * Get properties to exclude from the autobind call.
   * @return {Array<String|RegExp>}
   */
  get _excludeFromAutoBind() {
    return [
      '$mount',
      '$update',
      '$destroy',
      '$terminate',
      '$log',
      '$on',
      '$once',
      '$off',
      '$emit',
      'mounted',
      'loaded',
      'ticked',
      'resized',
      'moved',
      'keyed',
      'scrolled',
      'destroyed',
      'terminated',
    ];
  }

  /**
   * @deprecated Use the static `config` property instead.
   * @return {BaseConfig}
   */
  get config() {
    return null;
  }

  /** @type {BaseConfig} */
  static config;

  /**
   * Get the component's refs.
   * @return {BaseRefs}
   */
  get $refs() {
    return getRefs(this, this.$el);
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

    const { name } = getConfig(this);

    /** @type {String} */
    this.$id = `${name}-${id}`;
    id += 1;

    /** @type {HTMLElement} */
    this.$el = element;

    this.$options = getOptions(this, element, getConfig(this));
    this.$children = getChildren(this, this.$el, getConfig(this).components || {});
    this.$services = new Services(this);

    if (!('__base__' in this.$el)) {
      Object.defineProperty(this.$el, '__base__', {
        get: () => this,
        configurable: true,
      });
    }

    // Autobind all methods to the instance
    autoBind(this, {
      exclude: [...this._excludeFromAutoBind],
    });

    let unbindMethods = [];
    this.$on('mounted', () => {
      this.$services.enableAll();
      unbindMethods = [...bindEvents(this)];
      mountComponents(this);
      this.$isMounted = true;
    });

    this.$on('updated', () => {
      this.$services.disableAll();
      unbindMethods.forEach((method) => method());
      unbindMethods = [...bindEvents(this)];
      this.$services.enableAll();
      mountOrUpdateComponents(this);
    });

    this.$on('destroyed', () => {
      this.$isMounted = false;
      this.$services.disableAll();
      unbindMethods.forEach((method) => method());
      destroyComponents(this);
    });

    if (__DEV__) {
      debug(this, 'constructor', this);
    }
    return this;
  }

  /**
   * Small helper to log stuff.
   *
   * @return {(...args: any) => void} A log function if the log options is active.
   */
  get $log() {
    return this.$options.log
      ? window.console.log.bind(window, `[${this.$options.name}]`)
      : function noop() {};
  }

  /**
   * Trigger the `mounted` callback.
   */
  $mount() {
    if (__DEV__) {
      debug(this, '$mount');
    }

    callMethod(this, 'mounted');
    return this;
  }

  /**
   * Update the instance children.
   */
  $update() {
    if (__DEV__) {
      debug(this, '$update');
    }

    callMethod(this, 'updated');
    return this;
  }

  /**
   * Trigger the `destroyed` callback.
   */
  $destroy() {
    if (__DEV__) {
      debug(this, '$destroy');
    }

    callMethod(this, 'destroyed');
    return this;
  }

  /**
   * Terminate a child instance when it is not needed anymore.
   * @return {void}
   */
  $terminate() {
    if (__DEV__) {
      debug(this, '$terminate');
    }

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
}
