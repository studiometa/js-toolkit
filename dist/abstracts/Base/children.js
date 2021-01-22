import _slicedToArray from "@babel/runtime/helpers/slicedToArray";

/**
 * @typedef {import('./index.js').default} Base
 * @typedef {import('./index.js').BaseComponent} BaseComponent
 * @typedef {import('./index.js').BaseAsyncComponent} BaseAsyncComponent
 * @typedef {import('./index.js').BaseHTMLElement} BaseHTMLElement
 * @typedef {import('./index.js').BaseConfigComponents} BaseConfigComponents
 */

/**
 * Get a child component.
 *
 * @param  {BaseHTMLElement}                  el             The root element of the child component.
 * @param  {BaseComponent|BaseAsyncComponent} ComponentClass A Base class or a Promise for async components.
 * @param  {Base}                             parent         The parent component instance.
 * @return {Base|Promise|'terminated'}                       A Base instance or a Promise resolving to a Base instance.
 */
function getChild(el, ComponentClass, parent) {
  // Return existing instance if it exists
  if (el.__base__) {
    return el.__base__;
  } // Return a new instance if the component class is a child of the Base class


  if ('$isBase' in ComponentClass) {
    var child = new ComponentClass(el);
    Object.defineProperty(child, '$parent', {
      get: function get() {
        return parent;
      }
    });
    return child;
  } // Resolve async components


  return ComponentClass().then(function (module) {
    var _module$default;

    // @ts-ignore
    return getChild(el, (_module$default = module.default) !== null && _module$default !== void 0 ? _module$default : module, parent);
  });
}
/**
 * Get a list of elements based on the name of a component.
 * @param  {String}                   nameOrSelector The name or selector to used for this component.
 * @param  {BaseHTMLElement|Document} element        The root element on which to query the selector, defaults to `document`.
 * @return {Array<HTMLElement>}                      A list of elements on which the component should be mounted.
 */


export function getComponentElements(nameOrSelector) {
  var element = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
  var selector = "[data-component=\"".concat(nameOrSelector, "\"]");
  var elements = [];

  try {
    elements = Array.from(element.querySelectorAll(selector)); // eslint-disable-next-line no-empty
  } catch (_unused) {} // If no child component found with the default selector, try a classic DOM selector


  if (elements.length === 0) {
    elements = Array.from(element.querySelectorAll(nameOrSelector));
  }

  return elements;
}
/**
 * Get child components.
 * @param  {Base}                 instance   The component's instance.
 * @param  {BaseHTMLElement}      element    The component's root element
 * @param  {BaseConfigComponents} components The children components' classes
 * @return {null|Object}                     Returns `null` if no child components are defined or an object of all child component instances
 */

export function getChildren(instance, element, components) {
  var children = Object.entries(components).reduce(function (acc, _ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        name = _ref2[0],
        ComponentClass = _ref2[1];

    var elements = getComponentElements(name, element);

    if (elements.length === 0) {
      return acc;
    }

    acc[name] = elements.map(function (el) {
      return getChild(el, ComponentClass, instance);
    }) // Filter out terminated children
    // @ts-ignore
    .filter(function (el) {
      return el !== 'terminated';
    });

    if (acc[name].length === 0) {
      delete acc[name];
    }

    return acc;
  }, {});
  instance.$emit('get:children', children);
  return children;
}
export default {
  getChildren: getChildren
};
//# sourceMappingURL=children.js.map