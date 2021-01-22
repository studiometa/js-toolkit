import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

import Options from './classes/Options';
import { warn } from './utils';
export function getOptions(instance, element, config) {
  var schema = _objectSpread({}, config.options || {});

  var prototype = instance;

  while (prototype) {
    var getterConfig = prototype.config;
    var staticConfig = prototype.constructor.config;

    if (getterConfig || staticConfig) {
      schema = Object.assign((getterConfig || {}).options || {}, (staticConfig || {}).options || {}, schema);
      prototype = Object.getPrototypeOf(prototype);
    } else {
      prototype = false;
    }
  }

  var propsToInclude = [{
    name: 'log',
    type: Boolean
  }, {
    name: 'debug',
    type: Boolean
  }, {
    name: 'name',
    type: String
  }];
  propsToInclude.forEach(function (prop) {
    schema[prop.name] = {
      type: prop.type,
      default: prop.type(config[prop.name])
    };
  });
  var propsToExclude = ['name', 'log', 'debug', 'components', 'refs', 'options'];
  Object.keys(config).forEach(function (propName) {
    if (propsToExclude.includes(propName)) {
      return;
    }

    var value = config[propName];
    var type = value === null || value === undefined ? Object : value.constructor;

    if (!Options.types.includes(type)) {
      type = Object;
    }

    warn(instance, '\n  Options must be defined in the `config.options` property.', "\n  Consider moving the `config.".concat(propName, "` option to `config.options.").concat(propName, "`."));

    if (type === Array || type === Object) {
      schema[propName] = {
        type: type,
        default: function _default() {
          return value;
        }
      };
    } else {
      schema[propName] = {
        type: type,
        default: value
      };
    }
  });
  var options = new Options(element, schema);
  var legacyOptions = {};

  if (element.dataset.options) {
    warn(instance, 'The `data-options` attribute usage is deprecated, use multiple `data-option-...` attributes instead.');

    try {
      legacyOptions = JSON.parse(element.dataset.options);
    } catch (err) {
      throw new Error('Can not parse the `data-options` attribute. Is it a valid JSON string?');
    }
  }

  Object.entries(legacyOptions).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        optionName = _ref2[0],
        optionValue = _ref2[1];

    options[optionName] = optionValue;
  });
  instance.$emit('get:options', options);
  return options;
}
export default {
  getOptions: getOptions
};
//# sourceMappingURL=options.js.map