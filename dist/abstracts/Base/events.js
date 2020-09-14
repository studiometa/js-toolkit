"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = bindEvents;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _getAllProperties = _interopRequireDefault(require("../../utils/object/getAllProperties"));

var _utils = require("./utils");

/**
 * Bind ref and children component's events to their corresponding method.
 *
 * @param  {Base} instance  A Base instance.
 * @return {Array}          A list of methods to unbind the events.
 */
function bindEvents(instance) {
  var _this = this;

  var unbindMethods = []; // Bind method to events on refs

  var eventMethods = (0, _getAllProperties.default)(instance).filter(function (_ref) {
    var _ref2 = (0, _slicedToArray2.default)(_ref, 1),
        name = _ref2[0];

    return name.startsWith('on');
  });
  Object.entries(instance.$refs).forEach(function (_ref3) {
    var _ref4 = (0, _slicedToArray2.default)(_ref3, 2),
        refName = _ref4[0],
        $refOrRefs = _ref4[1];

    var $refs = Array.isArray($refOrRefs) ? $refOrRefs : [$refOrRefs];
    var refEventMethod = "on".concat(refName.replace(/^\w/, function (c) {
      return c.toUpperCase();
    }));
    eventMethods.filter(function (_ref5) {
      var _ref6 = (0, _slicedToArray2.default)(_ref5, 1),
          eventMethod = _ref6[0];

      return eventMethod.startsWith(refEventMethod);
    }).forEach(function (_ref7) {
      var _ref8 = (0, _slicedToArray2.default)(_ref7, 1),
          eventMethod = _ref8[0];

      $refs.forEach(function ($ref, index) {
        var eventName = eventMethod.replace(refEventMethod, '').toLowerCase();

        var handler = function handler() {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _utils.debug.apply(void 0, [_this, eventMethod, $ref].concat(args, [index]));

          _this[eventMethod].apply(_this, args.concat([index]));
        };

        var unbindMethod = function unbindMethod() {};

        if ($ref.constructor && $ref.constructor.__isBase__) {
          var unbindComponentEvent = $ref.$on(eventName, handler);
          $ref.$el.addEventListener(eventName, handler);

          unbindMethod = function unbindMethod() {
            unbindComponentEvent();
            $ref.$el.removeEventListener(eventName, handler);
          };
        } else {
          $ref.addEventListener(eventName, handler);

          unbindMethod = function unbindMethod() {
            $ref.removeEventListener(eventName, handler);
          };
        }

        unbindMethods.push(unbindMethod);
      });
    });
    eventMethods = eventMethods.filter(function (_ref9) {
      var _ref10 = (0, _slicedToArray2.default)(_ref9, 1),
          eventMethod = _ref10[0];

      return !eventMethod.startsWith(refEventMethod);
    });
  });
  eventMethods.forEach(function (_ref11) {
    var _ref12 = (0, _slicedToArray2.default)(_ref11, 1),
        eventMethod = _ref12[0];

    var eventName = eventMethod.replace(/^on/, '').toLowerCase();

    var handler = function handler() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      _utils.debug.apply(void 0, [_this, eventMethod, _this.$el].concat(args));

      _this[eventMethod].apply(_this, args);
    };

    instance.$el.addEventListener(eventName, handler);
    unbindMethods.push(function () {
      instance.$el.removeEventListener(eventName, handler);
    });
  });
  return unbindMethods;
}
//# sourceMappingURL=events.js.map