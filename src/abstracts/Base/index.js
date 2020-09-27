import nanoid from 'nanoid/non-secure';
import autoBind from '../../utils/object/autoBind';
import EventManager from '../EventManager';
import { callMethod, debug } from './utils';
import { getChildren } from './children';
import { getOptions, setOptions } from './options';
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
    return getChildren(this, this.$el, this.config.components || {});
  }

  /**
   * Get the component's merged config and options.
   * @return {Object}
   */
  get $options() {
    return getOptions(this, this.$el, this.config);
  }

  /**
   * Set the components option.
   * @param  {Object} value The new options values to merge with the old ones.
   * @return {void}
   */
  set $options(newOptions) {
    setOptions(this, this.$el, newOptions);
  }

  /**
   * Class constructor where all the magic takes place.
   *
   * @param  {HTMLElement} element The component's root element.
   * @return {Base}                A Base instance.
   */
  constructor(element) {
    super();

    if (!this.config) {
      throw new Error('The `config` getter must be defined.');
    }

    if (!this.config.name) {
      throw new Error('The `config.name` property is required.');
    }

    if (!element) {
      throw new Error('The root element must be defined.');
    }

    Object.defineProperties(this, {
      $id: {
        value: `${this.config.name}-${nanoid()}`,
      },
      $isMounted: {
        value: false,
        writable: true,
      },
      $el: {
        value: element,
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
        '$destroy',
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
        ...(this._excludeFromAutoBind || []),
      ],
    });

    let unbindMethods = [];
    this.$on('mounted', () => {
      mountComponents(this);
      unbindMethods = [...bindServices(this), ...bindEvents(this)];
      this.$isMounted = true;
    });

    this.$on('destroyed', () => {
      this.$isMounted = false;
      unbindMethods.forEach(method => method());
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
    return this.$options.log
      ? window.console.log.apply(window, [this.config.name, ...args])
      : () => {};
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
    mountComponents(this);
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
}

Base.__isBase__ = true;
