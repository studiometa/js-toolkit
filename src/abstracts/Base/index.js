import nanoid from 'nanoid/non-secure';
import autoBind from '../../utils/object/autoBind';
import EventManager from '../EventManager';
import { callMethod, debug, getConfig } from './utils';
// eslint-disable-next-line import/no-cycle
import { getChildren, getComponentElements } from './children';
import { getOptions } from './options';
import { getRefs } from './refs';
import { mountComponents, destroyComponents } from './components';
import bindServices from './services';
// eslint-disable-next-line import/no-cycle
import bindEvents from './events';

/**
 * @typedef {typeof Base} BaseComponent
 * @typedef {() => Promise<BaseComponent | { default: BaseComponent }>} BaseAsyncComponent
 * @typedef {{ name: string, debug: boolean, log: boolean }} BaseOptions
 * @typedef {{ [name:string]: HTMLElement | BaseComponent | Array<HTMLElement|BaseComponent> }} BaseRefs
 * @typedef {{ [nameOrSelector:string]: Array<Base | Promise<Base>> }} BaseChildren
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
   * Get the component's children components.
   * @return {BaseChildren}
   */
  get $children() {
    const { components } = getConfig(this);
    return getChildren(this, this.$el, components || {});
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
    this.$id = `${name}-${nanoid()}`;

    /** @type {HTMLElement} */
    this.$el = element;

    /** @type {BaseOptions} */
    this.$options = getOptions(this, element, getConfig(this));

    if (!('__base__' in this.$el)) {
      Object.defineProperty(this.$el, '__base__', {
        get: () => this,
        configurable: true,
      });
    }

    // Autobind all methods to the instance
    autoBind(this, {
      exclude: [...(this._excludeFromAutoBind || [])],
    });

    let unbindMethods = [];
    this.$on('mounted', () => {
      mountComponents(this);
      unbindMethods = [...bindServices(this), ...bindEvents(this)];
      this.$isMounted = true;
    });

    this.$on('updated', () => {
      unbindMethods.forEach((method) => method());
      mountComponents(this);
      unbindMethods = [...bindServices(this), ...bindEvents(this)];
    });

    this.$on('destroyed', () => {
      this.$isMounted = false;
      unbindMethods.forEach((method) => method());
      destroyComponents(this);
    });

    debug(this, 'constructor', this);
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
    debug(this, '$mount');
    callMethod(this, 'mounted');
    return this;
  }

  /**
   * Update the instance children.
   */
  $update() {
    debug(this, '$update');
    callMethod(this, 'updated');
    return this;
  }

  /**
   * Trigger the `destroyed` callback.
   */
  $destroy() {
    debug(this, '$destroy');
    callMethod(this, 'destroyed');
    return this;
  }

  /**
   * Terminate a child instance when it is not needed anymore.
   * @return {void}
   */
  $terminate() {
    debug(this, '$terminate');

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
