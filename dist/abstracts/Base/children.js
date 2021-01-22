import _slicedToArray from "@babel/runtime/helpers/slicedToArray";

function getChild(el, ComponentClass, parent) {
  if (el.__base__) {
    return el.__base__;
  }

  if ('$isBase' in ComponentClass) {
    var child = new ComponentClass(el);
    Object.defineProperty(child, '$parent', {
      get: function get() {
        return parent;
      }
    });
    return child;
  }

  return ComponentClass().then(function (module) {
    var _module$default;

    return getChild(el, (_module$default = module.default) !== null && _module$default !== void 0 ? _module$default : module, parent);
  });
}

export function getComponentElements(nameOrSelector) {
  var element = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
  var selector = "[data-component=\"".concat(nameOrSelector, "\"]");
  var elements = [];

  try {
    elements = Array.from(element.querySelectorAll(selector));
  } catch (_unused) {}

  if (elements.length === 0) {
    elements = Array.from(element.querySelectorAll(nameOrSelector));
  }

  return elements;
}
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
    }).filter(function (el) {
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