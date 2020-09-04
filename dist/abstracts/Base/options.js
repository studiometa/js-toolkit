"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOptions = getOptions;
exports.setOptions = setOptions;
exports.default = void 0;

var _deepmerge = _interopRequireDefault(require("deepmerge"));

/**
 * Get a component's options.
 *
 * @param  {Base}        instance The component's instance.
 * @param  {HTMLElement} element  The component's root element.
 * @param  {Object}      config   The component's default config.
 * @return {Object}               The component's merged options.
 */
function getOptions(instance, element, config) {
  var options = {};

  if (element.dataset.options) {
    try {
      options = JSON.parse(element.dataset.options);
    } catch (err) {
      throw new Error('Can not parse the `data-options` attribute. Is it a valid JSON string?');
    }
  }

  options = (0, _deepmerge.default)(config, options);
  instance.$emit('get:options', options);
  return options;
}
/**
 * Set a component instance options.
 *
 * @param {Base}        instance   The component's instance.
 * @param {HTMLElement} element    The component's root element.
 * @param {Object}      newOptions The new options object.
 */


function setOptions(instance, element, newOptions) {
  var options = {};

  if (element.dataset.options) {
    try {
      options = JSON.parse(element.dataset.options);
    } catch (err) {
      throw new Error('Can not parse the `data-options` attribute. Is it a valid JSON string?');
    }
  }

  options = (0, _deepmerge.default)(options, newOptions);
  element.dataset.options = JSON.stringify(options);
}

var _default = {
  getOptions: getOptions,
  setOptions: setOptions
};
exports.default = _default;
//# sourceMappingURL=options.js.map