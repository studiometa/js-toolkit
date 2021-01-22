import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/* eslint no-underscore-dangle: ["error", { "allow": ["__isTransitioning__", "__transitionEndHandler__"] }] */
import nextFrame from '../nextFrame';
import * as classes from './classes';
import * as styles from './styles';
/** WeakMap to hold the transition instances. */

var cache = new WeakMap();
/**
 * Transition class.
 */

var Transition = /*#__PURE__*/function () {
  /**
   * Is a transition currently running?
   * @type {Boolean}
   */

  /**
   * A callback to execute when the transition ends.
   * @type {EventListenerOrEventListenerObject|null}
   */

  /**
   * Instantiate and save the instance to the cache.
   * @param {HTMLElement} element The HTML element.
   */
  function Transition(element) {
    _classCallCheck(this, Transition);

    _defineProperty(this, "isTransitioning", false);

    _defineProperty(this, "transitionEndHandler", null);

    cache.set(element, this);
  }
  /**
   * Get the transition class attached to the given element.
   * @param  {HTMLElement} element The HTML element concerned by the transition.
   * @return {Transition}          The transition instance tied to the given element.
   */


  _createClass(Transition, null, [{
    key: "getInstance",
    value: function getInstance(element) {
      var instance = cache.get(element);

      if (!instance) {
        instance = new this(element);
      }

      return instance;
    }
  }]);

  return Transition;
}();
/**
 * Update either the classes or the styles of an element with the given method.
 *
 * @param {HTMLElement}   element         The element to update.
 * @param {String|Object} classesOrStyles The classes or styles to apply.
 * @param {String}        method          The method to use, one of `add` or `remove`.
 */


export function setClassesOrStyles(element, classesOrStyles) {
  var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'add';

  if (typeof classesOrStyles === 'string') {
    classes[method](element, classesOrStyles, method);
  } else {
    styles[method](element, classesOrStyles, method);
  }
}
/**
 * Test if the given element has a transition duration.
 *
 * @param  {HTMLElement} element The element to test.
 * @return {Boolean}             The result of the test.
 */

function testTransition(element) {
  if (typeof window === 'undefined') {
    return false;
  }

  var _window$getComputedSt = window.getComputedStyle(element),
      transitionDuration = _window$getComputedSt.transitionDuration;

  return !!transitionDuration && transitionDuration !== '0s';
}
/**
 * Apply the from state.
 *
 * @param {HTMLElement}   element         The target element.
 * @param {String|Object} classesOrStyles The classes or styles definition.
 * @return {Promise}
 */


function start(_x, _x2) {
  return _start.apply(this, arguments);
}
/**
 * Apply the active state.
 *
 * @param {HTMLElement}   element         The target element.
 * @param {String|Object} classesOrStyles The classes or styles definition.
 * @return {Promise}
 */


function _start() {
  _start = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(element, classesOrStyles) {
    var trs;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            trs = Transition.getInstance(element);
            trs.isTransitioning = true;
            setClassesOrStyles(element, classesOrStyles.from);
            _context.next = 5;
            return nextFrame();

          case 5:
            setClassesOrStyles(element, classesOrStyles.active);
            _context.next = 8;
            return nextFrame();

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _start.apply(this, arguments);
}

function next(_x3, _x4) {
  return _next.apply(this, arguments);
}
/**
 * Apply the final state.
 *
 * @param {HTMLElement}   element         The target element.
 * @param {String|Object} classesOrStyles The classes or styles definition.
 * @param {String}        mode            Whether to remove or keep the `to`  classes/styles.
 * @return {void}
 */


function _next() {
  _next = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(element, classesOrStyles) {
    var hasTransition;
    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            hasTransition = testTransition(element);
            /* eslint-disable-next-line */

            return _context3.abrupt("return", new Promise( /*#__PURE__*/function () {
              var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(resolve) {
                var trs;
                return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        if (hasTransition) {
                          trs = Transition.getInstance(element);
                          trs.transitionEndHandler = resolve;
                          element.addEventListener('transitionend', trs.transitionEndHandler, false);
                        }

                        setClassesOrStyles(element, classesOrStyles.from, 'remove');
                        setClassesOrStyles(element, classesOrStyles.to);
                        _context2.next = 5;
                        return nextFrame();

                      case 5:
                        if (!hasTransition) {
                          resolve();
                        }

                      case 6:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
              }));

              return function (_x7) {
                return _ref.apply(this, arguments);
              };
            }()));

          case 2:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _next.apply(this, arguments);
}

function end(element, classesOrStyles) {
  var mode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'remove';
  var trs = Transition.getInstance(element);
  element.removeEventListener('transitionend', trs.transitionEndHandler, false);

  if (mode === 'remove') {
    setClassesOrStyles(element, classesOrStyles.to, 'remove');
  }

  setClassesOrStyles(element, classesOrStyles.active, 'remove');
  trs.isTransitioning = false;
  trs.transitionEndHandler = null;
}
/**
 * Manage CSS transition with class.
 *
 * This is heavily inspired by the Vue `<transition>` component
 * and the `@barba/css` package, many thanks to them!
 *
 * @param  {HTMLElement}   element The target element.
 * @param  {String|Object} name    The name of the transition or an object with the hooks classesOrStyles.
 * @param  {String}        endMode    Whether to remove or keep the `to` classes/styles
 * @return {Promise}               A promise resolving at the end of the transition.
 */


export default function transition(_x5, _x6) {
  return _transition.apply(this, arguments);
}

function _transition() {
  _transition = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(element, name) {
    var endMode,
        classesOrStyles,
        trs,
        _args4 = arguments;
    return _regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            endMode = _args4.length > 2 && _args4[2] !== undefined ? _args4[2] : 'remove';
            classesOrStyles = typeof name === 'string' ? {
              from: "".concat(name, "-from"),
              active: "".concat(name, "-active"),
              to: "".concat(name, "-to")
            } : _objectSpread({
              from: '',
              active: '',
              to: ''
            }, name);
            trs = Transition.getInstance(element); // End any previous transition running on the element.

            if (trs.isTransitioning) {
              end(element, classesOrStyles);
            }

            _context4.next = 6;
            return start(element, classesOrStyles);

          case 6:
            _context4.next = 8;
            return next(element, classesOrStyles);

          case 8:
            end(element, classesOrStyles, endMode);
            return _context4.abrupt("return", Promise.resolve());

          case 10:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _transition.apply(this, arguments);
}
//# sourceMappingURL=transition.js.map