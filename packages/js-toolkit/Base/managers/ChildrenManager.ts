import type { Base, BaseConstructor, BaseAsyncConstructor, BaseEl } from '../index.js';
import { AbstractManager } from './AbstractManager.js';
import { getComponentElements, addToQueue } from '../utils.js';
import { startsWith } from '../../utils/index.js';

/**
 * Get a child component's instance.
 *
 * @param {ChildrenManager} that
 * @param {HTMLElement & { __base__?: WeakMap<BaseConstructor, Base> }} el
 *   The root element of the child component.
 * @param {BaseConstructor|BaseAsyncConstructor} ComponentClass
 *   A Base class or a Promise for async components.
 * @returns {Base|Promise<Base | 'terminated'>|'terminated'}
 *   A Base instance or a Promise resolving to a Base instance.
 * @private
 */
function __getChild(
  // eslint-disable-next-line no-use-before-define
  that: ChildrenManager,
  el: BaseEl,
  ComponentClass: BaseConstructor | BaseAsyncConstructor,
): Base | Promise<Base | 'terminated'> | 'terminated' {
  const asyncComponentPromise = that.__asyncComponentPromises.get(
    ComponentClass as BaseAsyncConstructor,
  );

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

    return __getChild(that, el, ctor);
  });
}

/**
 * Execute the given hook for all children instances.
 *
 * @param {ChildrenManager} that
 * @param {'$mount'|'$update'|'$destroy'} hook The hook to execute.
 * @private
 */
// eslint-disable-next-line no-use-before-define
async function __triggerHookForAll(that: ChildrenManager, hook: '$mount' | '$update' | '$destroy') {
  return addToQueue(() => {
    const promises = [];
    for (const name of that.registeredNames) {
      for (const instance of that[name]) {
        if (instance instanceof Promise) {
          promises.push(
            instance.then((resolvedInstance) =>
              addToQueue(() => that.__triggerHook(hook, resolvedInstance, name)),
            ),
          );
        } else {
          promises.push(addToQueue(() => that.__triggerHook(hook, instance, name)));
        }
      }
    }
    return Promise.all(promises);
  });
}

/**
 * Children manager.
 */
export class ChildrenManager extends AbstractManager {
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

  get registeredNames(): string[] {
    return Object.keys(this).filter((key) => !startsWith(key, '__'));
  }

  /**
   * Register instances of all children components.
   */
  async registerAll() {
    const promises = [];

    for (const [name, component] of Object.entries(this.__config.components)) {
      promises.push(this.__register(name, component));
    }

    await Promise.all(promises);
  }

  /**
   * Mount all child component instances.
   */
  async mountAll() {
    await __triggerHookForAll(this, '$mount');
  }

  /**
   * Update all child component instances.
   */
  async updateAll() {
    await __triggerHookForAll(this, '$update');
  }

  /**
   * Destroy all child component instances.
   */
  async destroyAll() {
    await __triggerHookForAll(this, '$destroy');
  }

  /**
   * Execute the given hook for the given instance.
   *
   * @param {'$mount'|'$update'|'$destroy'} hook The hook to trigger.
   * @param {Base} instance The target instance.
   * @param {string} name The name of the component.
   * @private
   */
  async __triggerHook(hook: '$mount' | '$update' | '$destroy', instance: Base, name: string) {
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

    await instance[hook]();
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
  __register(name: string, component: BaseConstructor | BaseAsyncConstructor) {
    Object.defineProperty(this, name, {
      enumerable: true,
      configurable: true,
      get: () => this.__getValue(name, component),
    });
  }

  __getValue(name: string, component: BaseConstructor | BaseAsyncConstructor) {
    const elements = getComponentElements(name, this.__element);

    if (elements.length === 0) {
      return [];
    }


    const children = [];
    for (const element of elements) {
      const child = __getChild(this, element, component);
      if (child !== 'terminated') {
        children.push(child);
      }
    }

    return children;
  }
}
