"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = bindServices;

var _pointer = _interopRequireDefault(require("../../services/pointer"));

var _raf = _interopRequireDefault(require("../../services/raf"));

var _resize = _interopRequireDefault(require("../../services/resize"));

var _scroll = _interopRequireDefault(require("../../services/scroll"));

var _key2 = _interopRequireDefault(require("../../services/key"));

var _utils = require("./utils");

/**
 * Init the given service and bind it to the given instance.
 *
 * @param  {Base}     instance The Base instance.
 * @param  {String}   method   The instance to test for binding
 * @param  {Function} service  The service `use...` function
 * @return {Function}          A function to unbind the service
 */
function initService(instance, method, service) {
  if (!(0, _utils.hasMethod)(instance, method)) {
    return function () {};
  }

  var _service = service(),
      add = _service.add,
      remove = _service.remove;

  add(instance.$id, function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _utils.callMethod.apply(void 0, [instance, method].concat(args));
  });
  return function () {
    return remove(instance.$id);
  };
}
/**
 * Use the services.
 * @param  {Base} instance A Base class instance.
 * @return {Array}         A list of unbind methods.
 */


function bindServices(instance) {
  var unbindMethods = [initService(instance, 'scrolled', _scroll.default), initService(instance, 'resized', _resize.default), initService(instance, 'ticked', _raf.default), initService(instance, 'moved', _pointer.default), initService(instance, 'keyed', _key2.default)]; // Fire the `loaded` method on window load
  // @todo remove this? or move it elsewhere?

  if ((0, _utils.hasMethod)(instance, 'loaded')) {
    var loadedHandler = function loadedHandler(event) {
      (0, _utils.callMethod)(instance, 'loaded', {
        event: event
      });
    };

    window.addEventListener('load', loadedHandler);
    unbindMethods.push(function () {
      window.removeEventListener('load', loadedHandler);
    });
  }

  return unbindMethods;
}
//# sourceMappingURL=services.js.map