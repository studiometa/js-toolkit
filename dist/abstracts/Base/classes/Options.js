import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _classPrivateFieldGet from "@babel/runtime/helpers/classPrivateFieldGet";
import _classPrivateFieldSet from "@babel/runtime/helpers/classPrivateFieldSet";
import deepmerge from 'deepmerge';
import { noCase } from 'no-case';
import isObject from "../../../utils/object/isObject.js";

function getAttributeName(name) {
  return "data-option-".concat(noCase(name, {
    delimiter: '-'
  }));
}

var _element = new WeakMap();

var _values = new WeakMap();

var _defaultValues = new WeakMap();

var Options = function () {
  function Options(element, schema) {
    var _this = this;

    _classCallCheck(this, Options);

    _element.set(this, {
      writable: true,
      value: void 0
    });

    _values.set(this, {
      writable: true,
      value: {}
    });

    _defaultValues.set(this, {
      writable: true,
      value: {
        String: '',
        Number: 0,
        Boolean: false,
        Array: function Array() {
          return [];
        },
        Object: function Object() {
          return {};
        }
      }
    });

    _classPrivateFieldSet(this, _element, element);

    Object.entries(schema).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          name = _ref2[0],
          config = _ref2[1];

      var isObjectConfig = !Options.types.includes(config);
      var type = isObjectConfig ? config.type : config;

      if (!Options.types.includes(type)) {
        throw new Error("The \"".concat(name, "\" option has an invalid type. The allowed types are: String, Number, Boolean, Array and Object."));
      }

      var defaultValue = isObjectConfig ? config.default : _classPrivateFieldGet(_this, _defaultValues)[type.name];

      if ((type === Array || type === Object) && typeof defaultValue !== 'function') {
        throw new Error("The default value for options of type \"".concat(type.name, "\" must be returned by a function."));
      }

      Object.defineProperty(_this, name, {
        get: function get() {
          return this.get(name, type, defaultValue);
        },
        set: function set(value) {
          this.set(name, type, value);
        },
        enumerable: true
      });
    });
    return this;
  }

  _createClass(Options, [{
    key: "get",
    value: function get(name, type, defaultValue) {
      var _this2 = this;

      var attributeName = getAttributeName(name);

      var hasAttribute = _classPrivateFieldGet(this, _element).hasAttribute(attributeName);

      if (type === Boolean) {
        if (!hasAttribute && defaultValue) {
          _classPrivateFieldGet(this, _element).setAttribute(attributeName, '');
        }

        return hasAttribute || defaultValue;
      }

      var value = _classPrivateFieldGet(this, _element).getAttribute(attributeName);

      if (type === Number) {
        return hasAttribute ? Number(value) : defaultValue;
      }

      if (type === Array || type === Object) {
        var val = deepmerge(defaultValue(), hasAttribute ? JSON.parse(value) : _classPrivateFieldGet(this, _defaultValues)[type.name]());

        if (!_classPrivateFieldGet(this, _values)[name]) {
          _classPrivateFieldGet(this, _values)[name] = val;
        } else if (val !== _classPrivateFieldGet(this, _values)[name]) {
          setTimeout(function () {
            _classPrivateFieldGet(_this2, _element).setAttribute(attributeName, JSON.stringify(_classPrivateFieldGet(_this2, _values)[name]));
          }, 0);
        }

        return _classPrivateFieldGet(this, _values)[name];
      }

      return hasAttribute ? value : defaultValue;
    }
  }, {
    key: "set",
    value: function set(name, type, value) {
      var attributeName = getAttributeName(name);

      if (value.constructor.name !== type.name) {
        var val = Array.isArray(value) || isObject(value) ? JSON.stringify(value) : value;
        throw new TypeError("The \"".concat(val, "\" value for the \"").concat(name, "\" option must be of type \"").concat(type.name, "\""));
      }

      switch (type) {
        case Boolean:
          if (value) {
            _classPrivateFieldGet(this, _element).setAttribute(attributeName, '');
          } else {
            _classPrivateFieldGet(this, _element).removeAttribute(attributeName);
          }

          break;

        case Array:
        case Object:
          _classPrivateFieldGet(this, _values)[name] = value;

          _classPrivateFieldGet(this, _element).setAttribute(attributeName, JSON.stringify(value));

          break;

        default:
          _classPrivateFieldGet(this, _element).setAttribute(attributeName, value);

      }
    }
  }]);

  return Options;
}();

_defineProperty(Options, "types", [String, Number, Boolean, Array, Object]);

export { Options as default };
//# sourceMappingURL=Options.js.map