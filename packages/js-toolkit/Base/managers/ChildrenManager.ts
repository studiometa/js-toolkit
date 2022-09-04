import type {
  Base,
  BaseConstructor,
  BaseAsyncConstructor,
  BaseEl,
} from '../index.js';
import AbstractManager from './AbstractManager.js';
import { getComponentElements } from '../utils.js';

/**
 * Get a child component's instance.
 *
 * @param {ChildrenManager} that
 * @param {HTMLElement & { __base__?: WeakMap<BaseConstructor, Base> }} el
 *   The root element of the child component.
 * @param {BaseConstructor|BaseAsyncConstructor} ComponentClass
 *   A Base class or a Promise for async components.
 * @param {string} name
 *   The name of the child component.
 * @returns {Base|Promise<Base | 'terminated'>|'terminated'}
 *   A Base instance or a Promise resolving to a Base instance.
 * @private
 */
function __getChild(
  // eslint-disable-next-line no-use-before-define
  that: ChildrenManager,
  el: BaseEl,
  ComponentClass: BaseConstructor | BaseAsyncConstructor,
  name: string,
): Base | Promise<Base | 'terminated'> | 'terminated' {
  const asyncComponentPromise = that.__asyncComponentPromises.get(ComponentClass as BaseAsyncConstructor);

  // Test if we have a constructor and not a promise or if the promise has been resolved
  if (
    '$isBase' in ComponentClass ||
    (asyncComponentPromise && asyncComponentPromise.status === 'resolved')
  ) {
    let ctor = ComponentClass as BaseConstructor;

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
    Object.defineProperty(child, '$parent', { get: () => that.__base });
    return child;
  }

  const promise = asyncComponentPromise
    ? asyncComponentPromise.promise
    : ComponentClass(that.__base);

  if (!asyncComponentPromise) {
    that.__asyncComponentPromises.set(ComponentClass, {
      promise,
      status: 'pending',
      ctor: undefined,
    });
  }

  // Resolve async components
  return promise.then((module) => {
    // @ts-ignore
    const ctor = module.default ?? module;

    that.__asyncComponentPromises.set(ComponentClass, {
      promise,
      status: 'resolved',
      ctor,
    });

    return __getChild(that, el, ctor, name);
  });
}

/**
 * Register instance of a child component.
 *
 * @param {ChildrenManager} that
 * @param {string} name
 *   The name of the child component.
 * @param {BaseConstructor|BaseAsyncConstructor} component
 *   A Base class or a Promise for async components.
 * @private
 */
function __register(
  // eslint-disable-next-line no-use-before-define
  that: ChildrenManager,
  name: string,
  component: BaseConstructor | BaseAsyncConstructor,
) {
  Object.defineProperty(that, name, {
    enumerable: true,
    configurable: true,
    get: () => {
      const elements = getComponentElements(name, that.__element);

      if (elements.length === 0) {
        return [];
      }

      return elements
        .map((element) => __getChild(that, element, component, name))
        .filter((instance) => instance !== 'terminated');
    },
  });
}

/**
 * Execute the given hook for the given instance.
 *
 * @param {ChildrenManager} that
 * @param {'$mount'|'$update'|'$destroy'} hook The hook to trigger.
 * @param {Base} instance The target instance.
 * @param {string} name The name of the component.
 * @private
 */
function __triggerHook(
  // eslint-disable-next-line no-use-before-define
  that: ChildrenManager,
  hook: '$mount' | '$update' | '$destroy',
  instance: Base,
  name: string,
) {
  if (hook === '$update' && !instance.$isMounted) {
    // eslint-disable-next-line no-param-reassign
    hook = '$mount';
  }

  if (hook === '$update' || hook === '$destroy') {
    that.__eventsManager.unbindChild(name, instance);
  }

  if (hook === '$update' || hook === '$mount') {
    that.__eventsManager.bindChild(name, instance);
  }

  instance[hook]();
}

/**
 * Execute the given hook for all children instances.
 *
 * @param {ChildrenManager} that
 * @param {'$mount'|'$update'|'$destroy'} hook The hook to execute.
 * @private
 */
// eslint-disable-next-line no-use-before-define
function __triggerHookForAll(that: ChildrenManager, hook: '$mount' | '$update' | '$destroy') {
  that.registeredNames.forEach((name) => {
    that[name].forEach((instance) => {
      if (instance instanceof Promise) {
        instance.then((resolvedInstance) => __triggerHook(that, hook, resolvedInstance, name));
      } else {
        __triggerHook(that, hook, instance, name);
      }
    });
  });
}

/**
 * Children manager.
 */
export default class ChildrenManager extends AbstractManager {
  /**
   * Store async component promises to avoid calling them multiple times and
   * waiting for them when they are already resolved.
   */
  __asyncComponentPromises: WeakMap<
    BaseAsyncConstructor,
    {
      promise: ReturnType<BaseAsyncConstructor>;
      status: 'pending' | 'resolved';
      ctor?: BaseConstructor;
    }
  > = new WeakMap();

  get registeredNames():string[] {
    return Object.keys(this).filter((key) => !key.startsWith('__'));
  }

  /**
   * Register instances of all children components.
   */
  registerAll() {
    Object.entries(this.__config.components).forEach(([name, component]) =>
      __register(this, name, component),
    );
  }

  /**
   * Mount all child component instances.
   */
  mountAll() {
    __triggerHookForAll(this, '$mount');
  }

  /**
   * Update all child component instances.
   */
  updateAll() {
    __triggerHookForAll(this, '$update');
  }

  /**
   * Destroy all child component instances.
   */
  destroyAll() {
    __triggerHookForAll(this, '$destroy');
  }
}
