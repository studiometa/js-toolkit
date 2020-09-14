"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = bindEvents;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _getAllProperties = _interopRequireDefault(require("../../utils/object/getAllProperties"));

var _utils = require("./utils");

/**
 * Bind event handler methods to the root HTML element.
 *
 * @param  {Base}  instance     A Base instance.
 * @param  {Array} eventMethods A list of methods to bind.
 * @return {Array}              A list of unbind functions.
 */
function bindRootEvents(instance, eventMethods) {
  return eventMethods.map(function (eventMethod) {
    var eventName = eventMethod.replace(/^on/, '').toLowerCase();

    var handler = function handler() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _utils.debug.apply(void 0, [instance, eventMethod, instance.$el].concat(args));

      instance[eventMethod].apply(instance, args);
    };

    instance.$el.addEventListener(eventName, handler);
    return function () {
      instance.$el.removeEventListener(eventName, handler);
    };
  });
}
/**
 * Bind event handler methods to refs HTML element.
 *
 * @param  {Base}  instance     A Base instance.
 * @param  {Array} eventMethods A list of methods to bind.
 * @return {Array}              A list of unbind functions.
 */


function bindRefsEvents(instance, eventMethods) {
  var unbindMethods = [];
  Object.entries(instance.$refs).forEach(function (_ref) {
    var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
        refName = _ref2[0],
        $refOrRefs = _ref2[1];

    var $refs = Array.isArray($refOrRefs) ? $refOrRefs : [$refOrRefs];
    var refEventMethod = "on".concat(refName.replace(/^\w/, function (c) {
      return c.toUpperCase();
    }));
    eventMethods.filter(function (eventMethod) {
      return eventMethod.startsWith(refEventMethod);
    }).forEach(function (eventMethod) {
      $refs.forEach(function ($ref, index) {
        var eventName = eventMethod.replace(refEventMethod, '').toLowerCase();

        var handler = function handler() {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          _utils.debug.apply(void 0, [instance, eventMethod, $ref].concat(args, [index]));

          instance[eventMethod].apply(instance, args.concat([index]));
        };

        (0, _utils.debug)(instance, 'binding ref event', refName, eventName);

        if ($ref.constructor && $ref.constructor.__isBase__) {
          // eslint-disable-next-line no-param-reassign
          $ref = $ref.$el;
        }

        $ref.addEventListener(eventName, handler);

        var unbindMethod = function unbindMethod() {
          (0, _utils.debug)(instance, 'unbinding ref event', eventMethods);
          $ref.removeEventListener(eventName, handler);
        };

        unbindMethods.push(unbindMethod);
      });
    });
  });
  return unbindMethods;
}
/**
 * Bind event handler methods to children Base instance.
 * @param  {Base}  instance     A Base instance.
 * @param  {Array} eventMethods A list of methods to bind.
 * @return {Array}              A list of unbind functions.
 */


function bindChildrenEvents(instance, eventMethods) {
  var unbindMethods = [];
  Object.entries(instance.$children).forEach(function (_ref3) {
    var _ref4 = (0, _slicedToArray2.default)(_ref3, 2),
        childName = _ref4[0],
        $children = _ref4[1];

    var childEventMethod = "on".concat(childName.replace(/^\w/, function (c) {
      return c.toUpperCase();
    }));
    eventMethods.filter(function (eventMethod) {
      return eventMethod.startsWith(childEventMethod);
    }).forEach(function (eventMethod) {
      $children.forEach(function ($child, index) {
        var eventName = eventMethod.replace(childEventMethod, '').toLowerCase();

        var handler = function handler() {
          for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
          }

          _utils.debug.apply(void 0, [instance, eventMethod, $child].concat(args, [index]));

          instance[eventMethod].apply(instance, args.concat([index]));
        };

        (0, _utils.debug)(instance, 'binding child event', childName, eventName);
        var unbindMethod = $child.$on(eventName, handler);
        unbindMethods.push(function () {
          (0, _utils.debug)(instance, 'unbinding child event', childName, eventName);
          unbindMethod();
        });
      });
    });
  });
  return unbindMethods;
}
/**
 * Bind ref and children component's events to their corresponding method.
 *
 * @param  {Base} instance  A Base instance.
 * @return {Array}          A list of methods to unbind the events.
 */


function bindEvents(instance) {
  var ROOT_EVENT_REGEX = /^on[A-Z][a-z]+$/;
  var REFS_CHILDREN_EVENT_REGEX = /^on([A-Z][a-z]+)([A-Z][a-z]+)+$/; // Get all event methods

  var eventMethods = (0, _getAllProperties.default)(instance).reduce(function (acc, _ref5) {
    var _ref6 = (0, _slicedToArray2.default)(_ref5, 1),
        name = _ref6[0];

    // Testing camelCase with one word: onEvent.
    if (ROOT_EVENT_REGEX.test(name)) {
      acc.root.push(name);
      return acc;
    } // Testing camelCase with more than two words: onRefEvent.


    if (REFS_CHILDREN_EVENT_REGEX.test(name)) {
      acc.refsOrChildren.push(name);
    }

    return acc;
  }, {
    root: [],
    refsOrChildren: []
  });
  var unbindMethods = [].concat((0, _toConsumableArray2.default)(bindRootEvents(instance, eventMethods.root)), (0, _toConsumableArray2.default)(bindRefsEvents(instance, eventMethods.refsOrChildren)), (0, _toConsumableArray2.default)(bindChildrenEvents(instance, eventMethods.refsOrChildren)));
  return unbindMethods;
}
//# sourceMappingURL=events.js.map