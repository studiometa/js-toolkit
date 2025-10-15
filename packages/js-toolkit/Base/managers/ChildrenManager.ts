import type { Base, BaseConstructor, BaseAsyncConstructor, BaseEl } from '../index.js';
import { AbstractManager } from './AbstractManager.js';
import { getComponentElements, addToQueue } from '../utils.js';

/**
 * Children manager.
 */
export class ChildrenManager<T> extends AbstractManager<T> {
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
    return Object.keys(this.props);
  }

  /**
   * Register instances of all children components.
   */
  async registerAll() {
    for (const [name, component] of Object.entries(this.__config.components)) {
      this.__register(name, component);
    }
  }

  /**
   * Mount all child component instances.
   */
  async mountAll() {
    await this.__triggerHookForAll('$mount');
  }

  /**
   * Update all child component instances.
   */
  async updateAll() {
    await this.__triggerHookForAll('$update');
  }

  /**
   * Destroy all child component instances.
   */
  async destroyAll() {
    await this.__triggerHookForAll('$destroy');
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
    Object.defineProperty(this.props, name, {
      enumerable: true,
      configurable: true,
      get: () => this.__getValue(name, component),
    });
  }

  /**
   * Get children.
   * @private
   */
  __getValue(name: string, component: BaseConstructor | BaseAsyncConstructor) {
    const elements = getComponentElements(name, this.__element);

    if (elements.length === 0) {
      return [];
    }

    const children = [];
    for (const element of elements) {
      const child = this.__getChild(element, component);
      if (child !== 'terminated') {
        children.push(child);
      }
    }

    return children;
  }

  /**
   * Get a child component's instance.
   *
   * @param {BaseEl} el
   *   The root element of the child component.
   * @param {BaseConstructor|BaseAsyncConstructor} ComponentClass
   *   A Base class or a Promise for async components.
   * @returns {Base|Promise<Base | 'terminated'>|'terminated'}
   *   A Base instance or a Promise resolving to a Base instance.
   * @private
   */
  __getChild(
    el: BaseEl,
    ComponentClass: BaseConstructor | BaseAsyncConstructor,
  ): Base | Promise<Base | 'terminated'> | 'terminated' {
    const asyncComponentPromise = this.__asyncComponentPromises.get(
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
      if (el.__base__ && el.__base__.has(ctor.config.name)) {
        return el.__base__.get(ctor.config.name);
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

      return this.__getChild(el, ctor);
    });
  }

  /**
   * Execute the given hook for all children instances.
   *
   * @param {'$mount'|'$update'|'$destroy'} hook The hook to execute.
   * @private
   */
  async __triggerHookForAll(hook: '$mount' | '$update' | '$destroy') {
    return addToQueue(() => {
      const promises = [];
      for (const name of this.registeredNames) {
        for (const instance of this.props[name]) {
          if (instance instanceof Promise) {
            instance.then((resolvedInstance) =>
              addToQueue(() => this.__triggerHook(hook, resolvedInstance, name)),
            );
          } else {
            promises.push(addToQueue(() => this.__triggerHook(hook, instance, name)));
          }
        }
      }
      return Promise.all(promises);
    });
  }
}
