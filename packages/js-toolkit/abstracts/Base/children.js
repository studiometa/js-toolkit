import { debug } from './utils.js';

/**
 * @typedef {import('./index.js').default} Base
 * @typedef {import('./index.js').BaseComponent} BaseComponent
 * @typedef {import('./index.js').BaseAsyncComponent} BaseAsyncComponent
 * @typedef {import('./index.js').BaseConfigComponents} BaseConfigComponents
 */

/**
 * Get a child component.
 *
 * @param {HTMLElement & { __base__?: Base | 'terminated' }} el
 *   The root element of the child component.
 * @param {BaseComponent|BaseAsyncComponent} ComponentClass
 *   A Base class or a Promise for async components.
 * @param {Base} parent
 *   The parent component instance.
 * @return {Base|Promise|'terminated'}
 *   A Base instance or a Promise resolving to a Base instance.
 */
function getChild(el, ComponentClass, parent) {
  // Return existing instance if it exists
  if (el.__base__) {
    return el.__base__;
  }

  // Return a new instance if the component class is a child of the Base class
  if ('$isBase' in ComponentClass) {
    const child = new ComponentClass(el);
    Object.defineProperty(child, '$parent', { get: () => parent });
    return child;
  }

  // Resolve async components
  return ComponentClass().then((module) => {
    // @ts-ignore
    return getChild(el, module.default ?? module, parent);
  });
}

/**
 * Get a list of elements based on the name of a component.
 *
 * @param {String} nameOrSelector
 *   The name or selector to used for this component.
 * @param {HTMLElement|Document} element
 *   The root element on which to query the selector, defaults to `document`.
 * @return {Array<HTMLElement>}
 *   A list of elements on which the component should be mounted.
 */
export function getComponentElements(nameOrSelector, element = document) {
  const selector = `[data-component="${nameOrSelector}"]`;
  let elements = [];

  try {
    elements = Array.from(element.querySelectorAll(selector));
    // eslint-disable-next-line no-empty
  } catch {}

  // If no child component found with the default selector, try a classic DOM selector
  if (elements.length === 0) {
    elements = Array.from(element.querySelectorAll(nameOrSelector));
  }

  return elements;
}

/**
 * Get child components.
 * @param  {Base}                 instance   The component's instance.
 * @param  {HTMLElement}          element    The component's root element
 * @param  {BaseConfigComponents} components The children components' classes
 * @return {null|Object}                     Returns `null` if no child components are defined or an object of all child component instances
 */
export function getChildren(instance, element, components) {
  debug(instance, 'before:getChildren', element, components);
  const children = Object.entries(components).reduce((acc, [name, ComponentClass]) => {
    Object.defineProperty(acc, name, {
      get() {
        const elements = getComponentElements(name, element);

        if (elements.length === 0) {
          return [];
        }

        return (
          elements
            .map((el) => getChild(el, ComponentClass, instance))
            // Filter out terminated children
            // @ts-ignore
            .filter((el) => el !== 'terminated')
        );
      },
      enumerable: true,
      configurable: true,
    });

    return acc;
  }, {});

  instance.$emit('get:children', children);
  debug(instance, 'after:getChildren', children);
  return children;
}

export default {
  getChildren,
};
