import nanoid from 'nanoid/non-secure';
import autoBind from '../../utils/object/autoBind';
import EventManager from '../EventManager';
import { callMethod, debug, log, getConfig } from './utils';
import { getChildren, getComponentElements } from './children';
import { getOptions } from './options';
import { getRefs } from './refs';
import { mountComponents, destroyComponents } from './components';
import bindServices from './services';
import bindEvents from './events';

/**
 * Page lifecycle class
 *
 * @method mounted   Fired when the class is instantiated
 * @method loaded    Fired on the window's load event
 * @method ticked    Fired each frame with `requestAnimationFrame`
 * @method resized   Fired when the window is resized (`resize` event)
 * @method moved     Fired when the pointer has moved (`touchmove` and `mousemove` events)
 * @method scrolled  Fired with debounce when the document is scrolled (`scroll` event)
 * @method destroyed Fired when the window is being unloaded (`unload` event)
 */
export default class Base extends EventManager {
  /**
   * Get the component's refs.
   * @return {Object}
   */
  get $refs() {
    return getRefs(this, this.$el);
  }

  /**
   * Get the component's children components.
   * @return {Object}
   */
  get $children() {
    const { components } = getConfig(this);
    return getChildren(this, this.$el, components || {});
  }

  /**
   * Class constructor where all the magic takes place.
   *
   * @param  {HTMLElement} element The component's root element.
   * @return {Base}                A Base instance.
   */
  constructor(element) {
    super();

    if (!element) {
      throw new Error('The root element must be defined.');
    }

    const { name } = getConfig(this);

    Object.defineProperties(this, {
      $id: {
        value: `${name}-${nanoid()}`,
      },
      $isMounted: {
        value: false,
        writable: true,
      },
      $el: {
        value: element,
      },
      $options: {
        value: getOptions(this, element, getConfig(this)),
      },
    });

    if (!this.$el.__base__) {
      Object.defineProperty(this.$el, '__base__', {
        get: () => this,
        configurable: true,
      });
    }

    // Autobind all methods to the instance
    autoBind(this, {
      exclude: [
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
        ...(this._excludeFromAutoBind || []),
      ],
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
    return this.$options.log ? log(this, ...args) : () => {};
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
    delete this.$el.__base__;

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
   * @param  {String}      selector The selector on which to mount each instance.
   * @return {Array<Base>}          A list of the created instance.
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

Base.__isBase__ = true;
