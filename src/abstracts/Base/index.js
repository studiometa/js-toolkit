import nanoid from 'nanoid/non-secure';
import autoBind from '../../utils/object/autoBind';
import EventManager from '../EventManager';
import { callMethod, debug, log, getConfig } from './utils';
import { getChildren, getComponentElements } from './children';
import { getOptions } from './options';
import { getRefs } from './refs';
import { mountComponents, destroyComponents } from './components';
import bindServices from './services';
// eslint-disable-next-line import/no-cycle
import bindEvents from './events';

/**
 * @typedef {HTMLElement & { __base__?: Base | 'terminated' }} BaseHTMLElement
 * @typedef {{ name: string, debug: boolean, log: boolean }} BaseOptions
 * @typedef {{ [name:string]: HTMLElement | Base | Array<HTMLElement|Base> }} BaseRefs
 * @typedef {{ [nameOrSelector:string]: Array<Base | Promise<Base>> }} BaseChildren
 * @typedef {{ [nameOrSelector:string]: Base | (() => Promise<Base>) }} BaseConfigComponents
 * @typedef {import('./classes/Options').OptionsSchema} BaseConfigOptions
 * @typedef {{ name: string, debug?: boolean, log?: boolean, refs?: String[], components?: BaseConfigComponents, options?: BaseConfigOptions }} BaseConfig
 */

/**
 * Page lifecycle class
 * @property {Boolean=false} $isMounted
 */
export default class Base extends EventManager {
  /**
   * The instance parent.
   * @type {Base}
   */
  $parent;

  /**
   * The state of the component.
   * @type {Boolean}
   */
  $isMounted = false;

  /**
   * Is this instance a child of another one?
   * @type {Boolean}
   */
  __isChild__ = false;

  /**
   * This is a Base instance.
   * @type {Boolean}
   */
  static __isBase__ = true;

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
   * @param {BaseHTMLElement} element The component's root element dd.
   */
  constructor(element) {
    super();

    if (!element) {
      throw new Error('The root element must be defined.');
    }

    const { name } = getConfig(this);

    /** @type {String} */
    this.$id = `${name}-${nanoid()}`;

    /** @type {BaseHTMLElement} */
    this.$el = element;

    /** @type {Boolean} */
    this.$isMounted = false;

    /** @type {BaseOptions} */
    this.$options = getOptions(this, element, getConfig(this));

    if (!this.$el.__base__) {
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

    // Mount class which are not used as another component's child.
    if (!this.__isChild__) {
      this.$mount();
      Object.defineProperty(this, '$parent', { get: () => null });
    }

    debug(this, 'constructor', this);
    return this;
  }

  /**
   * Small helper to log stuff.
   *
   * @param  {...any} args The arguments passed to the method
   * @return {void}
   */
  $log(...args) {
    if (this.$options.log) {
      log(this, ...args);
    }
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

    return getComponentElements(nameOrSelector).map((el) => new this(el));
  }
}
