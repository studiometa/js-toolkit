import { getComponentElements } from '../utils.js';

/**
 * @typedef {import('../index.js').default} Base
 * @typedef {import('../index.js').BaseComponent} BaseComponent
 * @typedef {import('../index.js').BaseAsyncComponent} BaseAsyncComponent
 * @typedef {import('../index.js').BaseConfigComponents} BaseConfigComponents
 */

/**
 * Children manager.
 */
export default class ChildrenManager {
  /** @type {Base} */
  #base;

  /** @type {HTMLElement} */
  #element;

  /** @type {BaseConfigComponents} */
  #components;

  /**
   * @return {string[]}
   */
  get #registeredNames() {
    return Object.keys(this);
  }

  /**
   * Class constructor.
   * @param  {Base}                 base       The component's instance.
   * @param  {HTMLElement}          element    The component's root element
   * @param  {BaseConfigComponents} components The children components' classes
   */
  constructor(base, element, components) {
    this.#base = base;
    this.#element = element;
    this.#components = components;
  }

  /**
   * Register instances of all children components.
   */
  registerAll() {
    Object.entries(this.#components).forEach(([name, component]) =>
      this.#register(name, component)
    );
  }

  /**
   * Register instance of a child component.
   *
   * @param {string} name
   *   The name of the child component.
   * @param {BaseComponent|BaseAsyncComponent} component
   *   A Base class or a Promise for async components.
   */
  #register(name, component) {
    Object.defineProperty(this, name, {
      enumerable: true,
      configurable: true,
      get: () => {
        const elements = getComponentElements(name, this.#element);

        if (elements.length === 0) {
          return [];
        }

        return elements
          .map((element) => this.#getChild(element, component))
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
   * @return {Base|Promise|'terminated'}
   *   A Base instance or a Promise resolving to a Base instance.
   */
  #getChild(el, ComponentClass) {
    // Return existing instance if it exists
    if (el.__base__) {
      return el.__base__;
    }

    // Return a new instance if the component class is a child of the Base class
    if ('$isBase' in ComponentClass) {
      const child = new ComponentClass(el);
      Object.defineProperty(child, '$parent', { get: () => this.#base });
      return child;
    }

    // Resolve async components
    return ComponentClass(this.#base).then((module) => {
      // @ts-ignore
      return this.#getChild(el, module.default ?? module);
    });
  }

  /**
   * Mount all child component instances.
   */
  mountAll() {
    this.#triggerHookForAll('$mount');
  }

  /**
   * Update all child component instances.
   */
  updateAll() {
    this.#triggerHookForAll('$update');
  }

  /**
   * Destroy all child component instances.
   */
  destroyAll() {
    this.#triggerHookForAll('$destroy');
  }

  /**
   * Execute the given hook for all children instances.
   *
   * @param {'$mount'|'$update'|'$destroy'} hook The hook to execute.
   */
  #triggerHookForAll(hook) {
    this.#registeredNames.forEach((name) => {
      this[name].forEach((instance) => {
        if (instance instanceof Promise) {
          instance.then((resolvedInstance) => this.#triggerHook(hook, resolvedInstance));
        } else {
          this.#triggerHook(hook, instance);
        }
      });
    });
  }

  /**
   * Execute the given hook for the given instance.
   *
   * @param {'$mount'|'$update'|'$destroy'} hook The hook to trigger.
   * @param {Base} instance The target instance.
   */
  #triggerHook(hook, instance) {
    if (hook === '$update' && !instance.$isMounted) {
      // eslint-disable-next-line no-param-reassign
      hook = '$mount';
    }
    instance[hook]();
  }
}
