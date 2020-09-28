/**
 * Get a child component.
 *
 * @param  {HTMLElement}  el             The root element of the child component.
 * @param  {Base|Promise} ComponentClass A Base class or a Promise for async components.
 * @param  {Base}         parent         The parent component instance.
 * @return {Base|Promise}                A Base instance or a Promise resolving to a Base instance.
 */
function getChild(el, ComponentClass, parent) {
  // Return existing instance if it exists
  if (el.__base__) {
    return el.__base__;
  }

  // Return a new instance if the component class is a child of the Base class
  if (ComponentClass.__isBase__) {
    Object.defineProperty(ComponentClass.prototype, '__isChild__', { value: true });
    const child = new ComponentClass(el);
    Object.defineProperty(child, '$parent', { get: () => parent });
    return child;
  }

  // Resolve async components
  const asyncComponent = ComponentClass().then((module) => {
    const ResolvedClass = module.default ? module.default : module;
    Object.defineProperty(ResolvedClass.prototype, '__isChild__', { value: true });
    const child = new ResolvedClass(el);
    Object.defineProperty(child, '$parent', { get: () => parent });
    return child;
  });

  asyncComponent.__isAsync__ = true;

  return asyncComponent;
}

/**
 *
 * @param  {Base}        instance   The component's instance.
 * @param  {HTMLElement} element    The component's root element
 * @param  {Object}      components The children components' classes
 * @return {null|Object}            Returns `null` if no child components are defined or an object of all child component instances
 */
export function getChildren(instance, element, components) {
  const children = Object.entries(components).reduce((acc, [name, ComponentClass]) => {
    const selector = `[data-component="${name}"]`;
    let elements = Array.from(element.querySelectorAll(selector));

    // If no child component found with the default selector, the name must be a DOM selector
    if (elements.length === 0) {
      elements = Array.from(element.querySelectorAll(name));
    }

    if (elements.length === 0) {
      return acc;
    }

    acc[name] = elements
      .map((el) => getChild(el, ComponentClass, instance))
      // Filter out terminated children
      .filter((el) => el !== 'terminated');

    if (acc[name].length === 0) {
      delete acc[name];
    }

    return acc;
  }, {});

  instance.$emit('get:children', children);
  return children;
}

export default {
  getChildren,
};
