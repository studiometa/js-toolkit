import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import Base from './index';
import getAllProperties from '../../utils/object/getAllProperties';
import { debug } from './utils';

function bindRootEvents(instance, eventMethods) {
  return eventMethods.map(function (eventMethod) {
    var eventName = eventMethod.replace(/^on/, '').toLowerCase();

    var handler = function handler() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      debug.apply(void 0, [instance, eventMethod, instance.$el].concat(args));
      instance[eventMethod].apply(instance, args);
    };

    instance.$el.addEventListener(eventName, handler);
    return function () {
      instance.$el.removeEventListener(eventName, handler);
    };
  });
}

function bindRefsEvents(instance, eventMethods) {
  var unbindMethods = [];
  Object.entries(instance.$refs).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
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

          debug.apply(void 0, [instance, eventMethod, $ref].concat(args, [index]));
          instance[eventMethod].apply(instance, args.concat([index]));
        };

        debug(instance, 'binding ref event', refName, eventName);

        if ($ref instanceof Base) {
          $ref = $ref.$el;
        }

        $ref.addEventListener(eventName, handler);

        var unbindMethod = function unbindMethod() {
          debug(instance, 'unbinding ref event', refName, eventMethod);
          $ref.removeEventListener(eventName, handler);
        };

        unbindMethods.push(unbindMethod);
      });
    });
  });
  return unbindMethods;
}

function bindChildrenEvents(instance, eventMethods) {
  var unbindMethods = [];
  Object.entries(instance.$children).forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
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

          debug.apply(void 0, [instance, eventMethod, $child].concat(args, [index]));
          instance[eventMethod].apply(instance, args.concat([index]));
        };

        debug(instance, 'binding child event', childName, eventName);
        var unbindMethod = $child.$on(eventName, handler);
        unbindMethods.push(function () {
          debug(instance, 'unbinding child event', childName, eventName);
          unbindMethod();
        });
      });
    });
  });
  return unbindMethods;
}

export default function bindEvents(instance) {
  var ROOT_EVENT_REGEX = /^on[A-Z][a-z]+$/;
  var REFS_CHILDREN_EVENT_REGEX = /^on([A-Z][a-z]+)([A-Z][a-z]+)+$/;
  var eventMethods = getAllProperties(instance).reduce(function (acc, _ref5) {
    var _ref6 = _slicedToArray(_ref5, 1),
        name = _ref6[0];

    if (ROOT_EVENT_REGEX.test(name)) {
      acc.root.push(name);
      return acc;
    }

    if (REFS_CHILDREN_EVENT_REGEX.test(name)) {
      acc.refsOrChildren.push(name);
    }

    return acc;
  }, {
    root: [],
    refsOrChildren: []
  });
  var unbindMethods = [].concat(_toConsumableArray(bindRootEvents(instance, eventMethods.root)), _toConsumableArray(bindRefsEvents(instance, eventMethods.refsOrChildren)), _toConsumableArray(bindChildrenEvents(instance, eventMethods.refsOrChildren)));
  return unbindMethods;
}
//# sourceMappingURL=events.js.map