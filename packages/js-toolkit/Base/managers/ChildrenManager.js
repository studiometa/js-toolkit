import { getComponentElements } from '../utils.js';

/**
 * @typedef {import('../index.js').default} Base
 * @typedef {import('../index.js').BaseConstructor} BaseConstructor
 * @typedef {import('../index.js').BaseAsyncConstructor} BaseAsyncConstructor
 * @typedef {import('../index.js').BaseConfigComponents} BaseConfigComponents
 * @typedef {import('./EventsManager.js').default} EventsManager
 */

/**
 * Children manager.
 */
export default class ChildrenManager {
  /**
   * @type {Base}
   * @private
   */
  __base;

  /**
   * @type {HTMLElement}
   * @private
   */
  __element;

  /**
   * @type {BaseConfigComponents}
   * @private
   */
  __components;

  /**
   * @type {EventsManager}
   * @private
   */
  __eventsManager;

  /**
   * @return {string[]}
   */
  get registeredNames() {
    return Object.keys(this).filter((key) => !key.startsWith('__'));
  }

  /**
   * Class constructor.
   * @param {Base} base
   *   The component's instance.
   * @param {HTMLElement} element
   *   The component's root element
   * @param {BaseConfigComponents} components
   *   The children components' classes
   * @param {EventsManager} eventsManager
   */
  constructor(base, element, components, eventsManager) {
    Object.defineProperties(this, {
      __base: {
        enumerable: false,
        writable: false,
        value: base,
      },
      __element: {
        enumerable: false,
        writable: false,
        value: element,
      },
      __components: {
        enumerable: false,
        writable: false,
        value: components,
      },
      __eventsManager: {
        enumerable: false,
        writable: false,
        value: eventsManager,
      },
    });
  }

  /**
   * Register instances of all children components.
   */
  registerAll() {
    Object.entries(this.__components).forEach(([name, component]) =>
      this.__register(name, component)
    );
  }

  /**
   * Register instance of a child component.
   *
   * @param {string} name
   *   The name of the child component.
   * @param {BaseConstructor|BaseAsyncConstructor} component
   *   A Base class or a Promise for async components.
   * @private
   */
  __register(name, component) {
    Object.defineProperty(this, name, {
      enumerable: true,
      configurable: true,
      get: () => {
        const elements = getComponentElements(name, this.__element);

        if (elements.length === 0) {
          return [];
        }

        return elements
          .map((element) => this.__getChild(element, component, name))
          .filter((instance) => instance !== 'terminated');
      },
    });
  }

  /**
   * Get a child component's instance.
   *
   * @param {HTMLElement & { __base__?: WeakMap<BaseConstructor, Base> }} el
   *   The root element of the child component.
   * @param {BaseConstructor|BaseAsyncConstructor} ComponentClass
   *   A Base class or a Promise for async components.
   * @param {string} name
   *   The name of the child component.
   * @return {Base|Promise|'terminated'}
   *   A Base instance or a Promise resolving to a Base instance.
   * @private
   */
  __getChild(el, ComponentClass, name) {
    const asyncComponentPromise = this.__asyncComponentPromises.get(
      /** @type {BaseAsyncConstructor} */ (ComponentClass)
    );

    // Test if we have a constructor and not a promise or if the promise has been resolved
    if (
      '$isBase' in ComponentClass ||
      (asyncComponentPromise && asyncComponentPromise.status === 'resolved')
    ) {
      let ctor = /** @type {BaseConstructor} */ (ComponentClass);

      // Get resolved constructor from weakmap.
      // Only test for existence as the status was checked before.
      if (asyncComponentPromise) {
        ctor = asyncComponentPromise.ctor;
      }

      // Return existing instance if it exists
      if (el.__base__ && el.__base__.has(ctor)) {
        return el.__base__.get(ctor);
      }

      // Return a new instance if the component class is a child of the Base class
      // eslint-disable-next-line new-cap
      const child = new ctor(el);
      Object.defineProperty(child, '$parent', { get: () => this.__base });
      return child;
    }

    const promise = asyncComponentPromise
      ? asyncComponentPromise.promise
      : ComponentClass(this.__base);

    if (!asyncComponentPromise) {
      this.__asyncComponentPromises.set(ComponentClass, {
        promise,
        status: 'pending',
        ctor: undefined,
      });
    }

    // Resolve async components
    return promise.then((module) => {
      // @ts-ignore
      const ctor = module.default ?? module;

      this.__asyncComponentPromises.set(ComponentClass, {
        promise,
        status: 'resolved',
        ctor,
      });

      return this.__getChild(el, ctor, name);
    });
  }

  /**
   * Store async component promises to avoid calling them multiple times and
   * waiting for them when they are already resolved.
   *
   * @private
   * @type {WeakMap<BaseAsyncConstructor, { promise: ReturnType<BaseAsyncConstructor>, status: 'pending'|'resolved', ctor?: BaseConstructor }>}
   */
  __asyncComponentPromises = new WeakMap();

  /**
   * Mount all child component instances.
   */
  mountAll() {
    this.__triggerHookForAll('$mount');
  }

  /**
   * Update all child component instances.
   */
  updateAll() {
    this.__triggerHookForAll('$update');
  }

  /**
   * Destroy all child component instances.
   */
  destroyAll() {
    this.__triggerHookForAll('$destroy');
  }

  /**
   * Execute the given hook for all children instances.
   *
   * @param {'$mount'|'$update'|'$destroy'} hook The hook to execute.
   * @private
   */
  __triggerHookForAll(hook) {
    this.registeredNames.forEach((name) => {
      this[name].forEach((instance) => {
        if (instance instanceof Promise) {
          instance.then((resolvedInstance) => this.__triggerHook(hook, resolvedInstance, name));
        } else {
          this.__triggerHook(hook, instance, name);
        }
      });
    });
  }

  /**
   * Execute the given hook for the given instance.
   *
   * @param {'$mount'|'$update'|'$destroy'} hook The hook to trigger.
   * @param {Base} instance The target instance.
   * @param {string} name The name of the component.
   * @private
   */
  __triggerHook(hook, instance, name) {
    if (hook === '$update' && !instance.$isMounted) {
      // eslint-disable-next-line no-param-reassign
      hook = '$mount';
    }

    if (hook === '$update' || hook === '$destroy') {
      this.__eventsManager.unbindChild(name, instance);
    }

    if (hook === '$update' || hook === '$mount') {
      this.__eventsManager.bindChild(name, instance);
    }

    instance[hook]();
  }
}
