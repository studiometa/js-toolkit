"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transition;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _nextFrame = _interopRequireDefault(require("./nextFrame"));

var _setClasses = _interopRequireDefault(require("./setClasses"));

var _setStyles = _interopRequireDefault(require("./setStyles"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * Update either the classes or the styles of an element with the given method.
 *
 * @param {HTMLElement}   element         The element to update.
 * @param {String|Object} classesOrStyles The classes or styles to apply.
 * @param {String}        method          The method to use, one of `add` or `remove`.
 */
function setClassesOrStyles(element, classesOrStyles) {
  var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'add';

  if (typeof classesOrStyles === 'string') {
    (0, _setClasses.default)(element, classesOrStyles, method);
  } else {
    (0, _setStyles.default)(element, classesOrStyles, method);
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
 * @return {Promise}
 */


function start(_x, _x2) {
  return _start.apply(this, arguments);
}
/**
 * Apply the active state.
 *
 * @return {Promise}
 */


function _start() {
  _start = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(element, classes) {
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            element.__isTransitioning__ = true;
            setClassesOrStyles(element, classes.from);
            _context.next = 4;
            return (0, _nextFrame.default)();

          case 4:
            setClassesOrStyles(element, classes.active);
            _context.next = 7;
            return (0, _nextFrame.default)();

          case 7:
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
 * @return {void}
 */


function _next() {
  _next = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3(element, classes) {
    var hasTransition;
    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            hasTransition = testTransition(element);
            /* eslint-disable-next-line */

            return _context3.abrupt("return", new Promise( /*#__PURE__*/function () {
              var _ref = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(resolve) {
                return _regenerator.default.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        if (hasTransition) {
                          element.__transitionEndHandler__ = resolve;
                          element.addEventListener('transitionend', element.__transitionEndHandler__, false);
                        }

                        setClassesOrStyles(element, classes.from, 'remove');

                        if (hasTransition) {
                          _context2.next = 5;
                          break;
                        }

                        _context2.next = 5;
                        return (0, _nextFrame.default)();

                      case 5:
                        setClassesOrStyles(element, classes.to);
                        _context2.next = 8;
                        return (0, _nextFrame.default)();

                      case 8:
                        if (!hasTransition) {
                          resolve();
                        }

                      case 9:
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

function end(element, classes) {
  element.removeEventListener('transitionend', element.__transitionEndHandler__, false);
  setClassesOrStyles(element, classes.to, 'remove');
  setClassesOrStyles(element, classes.active, 'remove');
  delete element.__isTransitioning__;
  delete element.__transitionEndHandler__;
}
/**
 * Manage CSS transition with class.
 *
 * This is heavily inspired by the Vue `<transition>` component
 * and the `@barba/css` package, many thanks to them!
 *
 * @param  {HTMLElement}   element The target element.
 * @param  {String|Object} name    The name of the transition or an object with the hooks classes.
 * @return {Promise}               A promise resolving at the end of the transition.
 */


function transition(_x5, _x6) {
  return _transition.apply(this, arguments);
}

function _transition() {
  _transition = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4(element, name) {
    var classes;
    return _regenerator.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            classes = typeof name === 'string' ? {
              from: "".concat(name, "-from"),
              active: "".concat(name, "-active"),
              to: "".concat(name, "-to")
            } : _objectSpread({
              from: '',
              active: '',
              to: ''
            }, name); // End any previous transition running on the element.

            if (!element.__isTransitioning__) {
              _context4.next = 5;
              break;
            }

            end(element, classes);
            _context4.next = 5;
            return (0, _nextFrame.default)();

          case 5:
            _context4.next = 7;
            return start(element, classes);

          case 7:
            _context4.next = 9;
            return next(element, classes);

          case 9:
            end(element, classes);
            return _context4.abrupt("return", Promise.resolve());

          case 11:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _transition.apply(this, arguments);
}
//# sourceMappingURL=transition.js.map