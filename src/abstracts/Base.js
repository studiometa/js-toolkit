import nanoid from 'nanoid/non-secure';
import autoBind from 'auto-bind';
import EventManager from './EventManager';
import hasMethod from '../utils/hasMethod';
import usePointer from '../services/pointer';
import useRaf from '../services/raf';
import useResize from '../services/resize';
import useScroll from '../services/scroll';
import useKey from '../services/key';

/**
 * Verbose debug for the component.
 * @param  {...any} args The arguments passed to the method
 * @return {void}
 */
function debug(instance, ...args) {
  return instance.$options.debug
    ? window.console.log.apply(window, [instance.config.name, ...args])
    : () => {};
}

/**
 * Get all refs of a component.
 *
 * @param {HTMLElement}  element The component's root element
 * @param {String}       name    The component's name
 * @return {null|Object}         Returns `null` if no refs were found or an object of references
 */
function getRefs(element, name) {
  const elements = Array.from(element.querySelectorAll(`[data-ref^="${name}."]`));

  if (elements.length === 0) {
    return null;
  }

  return elements.reduce(($refs, $ref) => {
    const refName = $ref.dataset.ref.replace(`${name}.`, '');
    // eslint-disable-next-line no-underscore-dangle
    const $realRef = $ref.__base__ ? $ref.__base__ : $ref;

    if ($refs[refName]) {
      if (Array.isArray($refs[refName])) {
        $refs[refName].push($realRef);
      } else {
        $refs[refName] = [$refs[refName], $realRef];
      }
    } else {
      $refs[refName] = $realRef;
    }

    return $refs;
  }, {});
}

/**
 *
 * @param  {HTMLElement} element    The component's root element
 * @param  {Object}      components The children components' classes
 * @return {null|Object}            Returns `null` if no child components are defined or an object of all child component instances
 */
function getChildren(element, components) {
  if (!components) {
    return null;
  }

  return Object.entries(components).reduce((acc, [name, ComponentClass]) => {
    const { config } = ComponentClass.prototype || {};
    const selector = config.el || `[data-component="${name}"]`;
    const elements = Array.from(element.querySelectorAll(selector));

    if (elements.length === 0) {
      return acc;
    }

    acc[name] = elements.map(el => {
      const { options } = el.dataset;
      return new ComponentClass(el, options);
    });

    return acc;
  }, {});
}

/**
 * Call the given method while applying the given arguments.
 *
 * @param {String} method The method to call
 * @param {...any} args   The arguments to pass to the method
 */
function call(instance, method, ...args) {
  debug(instance, 'call', method, ...args);

  // Prevent duplicate call of `mounted` and `destroyed`
  // methods based on the component status
  if (
    (method === 'destroyed' && !instance.$isMounted) ||
    (method === 'mounted' && instance.$isMounted)
  ) {
    debug(instance, 'not', method, 'because the method has already been triggered once.');
    return instance;
  }

  instance.$emit(method, ...args);

  // We always emit an event, but we do not call the method if it does not exist
  if (!hasMethod(instance, method)) {
    return instance;
  }

  instance[method].call(instance, ...args);
  debug(instance, method, instance, ...args);

  return instance;
}

/**
 * Tie the components' `mounted` method to the instance
 */
function mountComponents(instance) {
  if (!instance.$children) {
    return;
  }
  debug(instance, 'mountComponents', instance.$children);

  Object.values(instance.$children).forEach($child => {
    if (Array.isArray($child)) {
      $child.forEach(c => {
        c.$mount();
      });
    } else {
      $child.$mount();
    }
  });
}

/**
 * Tie the components' `destroyed` method to the instance.
 *
 * @param  {Base} instance The base instance.
 * @return {void}
 */
function destroyComponents(instance) {
  if (!instance.$children) {
    return;
  }
  debug(instance, 'destroyComponents', instance.$children);

  Object.values(instance.$children).forEach($child => {
    if (Array.isArray($child)) {
      $child.forEach(c => {
        c.$destroy();
      });
    } else {
      $child.$destroy();
    }
  });
}

/**
 * Init the given service and bind it to the given instance.
 *
 * @param  {Base}     instance The Base instance.
 * @param  {String}   method   The instance to test for binding
 * @param  {Function} service  The service `use...` function
 * @return {Function}          A function to unbind the service
 */
function initService(instance, method, service) {
  if (!hasMethod(instance, method)) {
    return () => {};
  }

  const { add, remove } = service();
  add(instance.$id, (...args) => {
    call(instance, method, ...args);
  });

  return () => remove(instance.$id);
}

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
   * Class constructor where all the magic takes place
   * @param  {Object}    options An option object
   * @return {Base}         The mounted instance
   */
  constructor(element) {
    super();

    if (!this.config) {
      throw new Error('The `config` getter must be defined.');
    }

    if (!this.config.name) {
      throw new Error('The `config.name` property is required.');
    }

    this.$isMounted = false;
    this.$id = `${this.config.name}-${nanoid()}`;
    this.$el = element || document.querySelector(this.config.el);

    if (!this.$el) {
      throw new Error('Unable to find the root element.');
    }

    let options = {};
    if (this.$el.dataset.options) {
      try {
        options = JSON.parse(this.$el.dataset.options);
      } catch (err) {
        throw new Error('Can not parse the `data-options` attribute. Is it a valid JSON string?');
      }
    }

    this.$options = { ...this.config, ...(options || {}) };

    debug(this, 'constructor', this);

    const $refs = getRefs(this.$el, this.config.name);
    if ($refs) {
      this.$refs = $refs;
    }

    const $children = getChildren(this.$el, this.config.components);
    if ($children) {
      this.$children = $children;
    }

    let unbindMethods = [];

    // Bind all the methods when the component is mounted,
    // we save the unbind methods to unbind them all when
    // the component is destroyed.
    this.$on('mounted', () => {
      unbindMethods = [];
      // Fire the `loaded` method on window load
      if (hasMethod(this, 'loaded')) {
        const loadedHandler = event => {
          call(this, 'loaded', { event });
        };
        window.addEventListener('load', loadedHandler);
        unbindMethods.push(() => {
          window.removeEventListener('load', loadedHandler);
        });
      }

      // Fire the `scrolled` method on window/document scroll
      unbindMethods = [
        ...unbindMethods,
        initService(this, 'scrolled', useScroll),
        initService(this, 'resized', useResize),
        initService(this, 'ticked', useRaf),
        initService(this, 'moved', usePointer),
        initService(this, 'keyed', useKey),
      ];

      mountComponents(this);
      this.$isMounted = true;
    });

    this.$on('destroyed', () => {
      this.$isMounted = false;
      unbindMethods.forEach(method => method());
      destroyComponents(this);
    });

    // Attach the instance to the root element
    // eslint-disable-next-line no-underscore-dangle
    this.$el.__base__ = this;

    // Autobind all methods to the instance
    autoBind(this);

    // Fire the `mounted` method on the next frame so the class
    // properties are correctly loaded
    requestAnimationFrame(() => {
      this.$mount();
    });

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
    call(this, 'mounted');
    return this;
  }

  /**
   * Trigger the `destroyed` callback.
   */
  $destroy() {
    debug(this, '$destroy');
    call(this, 'destroyed');
    return this;
  }
}
