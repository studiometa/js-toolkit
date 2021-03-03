import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _slicedToArray from "@babel/runtime/helpers/slicedToArray";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

import Options from "./classes/Options.js";
import { warn } from "./utils.js";

function getLegacyOptionsSchema(instance, config) {
  var propsToExclude = ['name', 'log', 'debug', 'components', 'refs', 'options'];
  return Object.keys(config).reduce(function (schema, propName) {
    if (propsToExclude.includes(propName)) {
      return schema;
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

    return schema;
  }, {});
}

function getParentOptionsSchema(instance) {
  var schema = {};
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

  return schema;
}

function updateOptionsWithLegacyValues(instance, element, options) {
  var legacyOptionsValues = {};

  if (element.dataset.options) {
    warn(instance, 'The `data-options` attribute usage is deprecated, use multiple `data-option-...` attributes instead.');

    try {
      legacyOptionsValues = JSON.parse(element.dataset.options);
    } catch (err) {
      throw new Error('Can not parse the `data-options` attribute. Is it a valid JSON string?');
    }
  }

  Object.entries(legacyOptionsValues).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        optionName = _ref2[0],
        optionValue = _ref2[1];

    options[optionName] = optionValue;
  });
}

export function getOptions(instance, element, config) {
  var _config$log, _config$debug;

  var schema = _objectSpread(_objectSpread(_objectSpread({
    name: {
      type: String,
      default: config.name
    },
    log: {
      type: Boolean,
      default: (_config$log = config.log) !== null && _config$log !== void 0 ? _config$log : false
    },
    debug: {
      type: Boolean,
      default: (_config$debug = config.debug) !== null && _config$debug !== void 0 ? _config$debug : false
    }
  }, getParentOptionsSchema(instance)), getLegacyOptionsSchema(instance, config)), config.options || {});

  var options = new Options(element, schema);
  updateOptionsWithLegacyValues(instance, element, options);
  instance.$emit('get:options', options);
  return options;
}
export default {
  getOptions: getOptions
};
//# sourceMappingURL=options.js.map