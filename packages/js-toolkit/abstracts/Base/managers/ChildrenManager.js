import { getComponentElements } from '../utils.js';

/**
 * @typedef {import('../index.js').default} Base
 * @typedef {import('../index.js').BaseComponent} BaseComponent
 * @typedef {import('../index.js').BaseAsyncComponent} BaseAsyncComponent
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
   * @private
   */
  get __registeredNames() {
    return Object.keys(this);
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
    this.__base = base;
    this.__element = element;
    this.__components = components;
    this.__eventsManager = eventsManager;
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
   * @param {BaseComponent|BaseAsyncComponent} component
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
   * @param {HTMLElement & { __base__?: Base | 'terminated' }} el
   *   The root element of the child component.
   * @param {BaseComponent|BaseAsyncComponent} ComponentClass
   *   A Base class or a Promise for async components.
   * @param {string} name
   *   The name of the child component.
   * @return {Base|Promise|'terminated'}
   *   A Base instance or a Promise resolving to a Base instance.
   * @private
   */
  __getChild(el, ComponentClass, name) {
    // Return existing instance if it exists
    if (el.__base__) {
      return el.__base__;
    }

    // Return a new instance if the component class is a child of the Base class
    if ('$isBase' in ComponentClass) {
      const child = new ComponentClass(el);
      Object.defineProperty(child, '$parent', { get: () => this.__base });
      return child;
    }

    // Resolve async components
    return ComponentClass(this.__base).then((module) => {
      // @ts-ignore
      return this.__getChild(el, module.default ?? module, name);
    });
  }

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
    this.__registeredNames.forEach((name) => {
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
