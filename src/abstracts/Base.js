/* eslint-disable no-underscore-dangle */
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
 *
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
 * @param  {Base}        instance The component's instance.
 * @param  {HTMLElement} element  The component's root element.
 * @return {Object}               Return an object containing all the component's refs.
 */
function getRefs(instance, element) {
  const allRefs = Array.from(element.querySelectorAll(`[data-ref]`));
  const childrenRefs = Array.from(element.querySelectorAll(`:scope [data-component] [data-ref]`));
  const elements = allRefs.filter(ref => !childrenRefs.includes(ref));

  const refs = elements.reduce(($refs, $ref) => {
    let refName = $ref.dataset.ref;
    const $realRef = $ref.__base__ ? $ref.__base__ : $ref;

    if (instance.$options.name) {
      refName = refName.replace(`${instance.$options.name}.`, '');
    }

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

  instance.$emit('get:refs', refs);
  return refs;
}

/**
 *
 * @param  {Base}        instance   The component's instance.
 * @param  {HTMLElement} element    The component's root element
 * @param  {Object}      components The children components' classes
 * @return {null|Object}            Returns `null` if no child components are defined or an object of all child component instances
 */
function getChildren(instance, element, components = {}) {
  const children = Object.entries(components).reduce((acc, [name, ComponentClass]) => {
    const selector = `[data-component="${name}"]`;
    const elements = Array.from(element.querySelectorAll(selector));

    if (elements.length === 0) {
      return acc;
    }

    acc[name] = elements.map(el => {
      // Return existing instance if it exists
      if (el.__base__) {
        return el.__base__;
      }

      // Return a new instance if the component class is a child of the Base class
      if (ComponentClass.__isBase__) {
        Object.defineProperty(ComponentClass.prototype, '__isChild__', { value: true });
        return new ComponentClass(el);
      }

      // Resolve async components
      const asyncComponent = ComponentClass().then(module => {
        const ResolvedClass = module.default;
        Object.defineProperty(ResolvedClass.prototype, '__isChild__', { value: true });
        return new ResolvedClass(el);
      });

      asyncComponent.__isAsync__ = true;

      return asyncComponent;
    });

    return acc;
  }, {});

  instance.$emit('get:children', children);
  return children;
}

/**
 * Get a component's options.
 *
 * @param  {Base}        instance The component's instance.
 * @param  {HTMLElement} element  The component's root element.
 * @param  {Object}      config   The component's default config.
 * @return {Object}               The component's merged options.
 */
function getOptions(instance, element, config = {}) {
  let options = {};
  if (element.dataset.options) {
    try {
      options = JSON.parse(element.dataset.options);
    } catch (err) {
      throw new Error('Can not parse the `data-options` attribute. Is it a valid JSON string?');
    }
  }

  options = { ...config, ...(options || {}) };
  instance.$emit('get:options', options);
  return options;
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
 * Mount a given component which might be async.
 *
 * @param  {Base|Promise} component The component to mount.
 * @return {void}
 */
function mountComponent(component) {
  if (component.__isAsync__) {
    component.then(instance => instance.$mount());
  } else {
    component.$mount();
  }
}

/**
 * Mount children components of a given instance.
 *
 * @param  {Base} instance The parent component's instance.
 * @return {void}
 */
function mountComponents(instance) {
  if (!instance.$children) {
    return;
  }

  debug(instance, 'mountComponents', instance.$children);

  Object.values(instance.$children).forEach($child => {
    if (Array.isArray($child)) {
      $child.forEach(mountComponent);
    } else {
      mountComponent($child);
    }
  });
}

/**
 * Destroy a given component which might be async.
 *
 * @param  {Base|Promise} component The component to destroy.
 * @return {void}
 */
function destroyComponent(component) {
  if (component.__isAsync__) {
    component.then(instance => instance.$destroy());
  } else {
    component.$destroy();
  }
}

/**
 * Destroy children components of a given instance.
 *
 * @param  {Base} instance The parent component's instance.
 * @return {void}
 */
function destroyComponents(instance) {
  if (!instance.$children) {
    return;
  }
  debug(instance, 'destroyComponents', instance.$children);

  Object.values(instance.$children).forEach($child => {
    if (Array.isArray($child)) {
      $child.forEach(destroyComponent);
    } else {
      destroyComponent($child);
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
    return getChildren(this, this.$el, (this.config || {}).components || {});
  }

  /**
   * Get the component's merged config and options.
   * @return {Object}
   */
  get $options() {
    return getOptions(this, this.$el, this.config || {});
  }

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

    if (!element) {
      throw new Error('The root element must be defined.');
    }

    // eslint-disable-next-line
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

    debug(this, 'constructor', this);

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

    if (!this.$el.__base__) {
      // Attach the instance to the root element
      Object.defineProperty(this.$el, '__base__', {
        get: () => this,
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
      ],
    });

    // Mount class which are not used as another component's child.
    if (!this.__isChild__) {
      this.$mount();
    }

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

Base.__isBase__ = true;
