import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import Base from '../abstracts/Base';
import * as styles from '../utils/css/styles';
import transition from '../utils/css/transition';
/**
 * Find the best position for an element to be displayed.
 *
 * @param  {HTMLElement} element Element to search best position.
 * @param  {Number}      offset  Offset to keep from window
 *
 * @return {Object} X, Y positions
 */

function findBestPosition(element, offset) {
  var contentSizes = element.getBoundingClientRect();
  var isOverflowingTop = contentSizes.top < offset;
  var isOverflowingRight = contentSizes.right > window.innerWidth - offset;
  var isOverflowingLeft = contentSizes.left < offset;
  var x = null;
  var y = isOverflowingTop ? 'bottom' : 'top';

  if (isOverflowingLeft) {
    x = Math.abs(contentSizes.left) + offset;
  }

  if (isOverflowingRight) {
    x = window.innerWidth - offset - Math.abs(contentSizes.right);
  }

  return {
    x: x,
    y: y
  };
}
/**
 * Tooltip class.
 */


var Tooltip = /*#__PURE__*/function (_Base) {
  _inherits(Tooltip, _Base);

  var _super = _createSuper(Tooltip);

  function Tooltip() {
    _classCallCheck(this, Tooltip);

    return _super.apply(this, arguments);
  }

  _createClass(Tooltip, [{
    key: "mounted",

    /**
     * Initialize the component's behaviours.
     *
     * @return {Tooltip} The current instance.
     */
    value: function () {
      var _mounted = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
        var _this$$refs, container, content, trigger;

        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this$$refs = this.$refs, container = _this$$refs.container, content = _this$$refs.content, trigger = _this$$refs.trigger;
                content.setAttribute('aria-labelledby', this.$id);
                trigger.setAttribute('id', this.$id);
                _context.next = 5;
                return this.close();

              case 5:
                if (!this.$options.isOpen) {
                  _context.next = 8;
                  break;
                }

                _context.next = 8;
                return this.open();

              case 8:
                return _context.abrupt("return", this);

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function mounted() {
        return _mounted.apply(this, arguments);
      }

      return mounted;
    }()
    /**
     * Unbind all events on destroy.
     *
     * @return {Tooltip} The Tooltip instance.
     */

  }, {
    key: "destroyed",
    value: function () {
      var _destroyed = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.close();

              case 2:
                return _context2.abrupt("return", this);

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function destroyed() {
        return _destroyed.apply(this, arguments);
      }

      return destroyed;
    }()
    /**
     * Close the tooltip on `ESC`.
     *
     * @param  {Boolean}       options.isUp   Is it a keyup event?
     * @param  {Boolean}       options.ESC    Is it the ESC key?
     * @return {void}
     */

  }, {
    key: "keyed",
    value: function () {
      var _keyed = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(_ref) {
        var isUp, ESC;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                isUp = _ref.isUp, ESC = _ref.ESC;

                if (this.isOpen) {
                  _context3.next = 3;
                  break;
                }

                return _context3.abrupt("return");

              case 3:
                if (!(ESC && isUp)) {
                  _context3.next = 6;
                  break;
                }

                _context3.next = 6;
                return this.close();

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function keyed(_x) {
        return _keyed.apply(this, arguments);
      }

      return keyed;
    }()
    /**
     * Set the position of the tooltip
     *
     * @return {void}
     */

  }, {
    key: "setPosition",
    value: function () {
      var _setPosition = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(position) {
        var _this = this;

        var allowed, list;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                allowed = ['top', 'bottom'];

                if (allowed.includes(position)) {
                  _context4.next = 4;
                  break;
                }

                list = allowed.map(function (pos) {
                  return "- ".concat(pos);
                }).join('\n');
                throw new Error("\"".concat(position, "\" is not an authorized position. Choose one in the list below:\n\n").concat(list, "\n"));

              case 4:
                return _context4.abrupt("return", Promise.all(Object.entries(this.$options.styles).map(function (_ref2) {
                  var _ref3 = _slicedToArray(_ref2, 2),
                      refName = _ref3[0],
                      _ref3$ = _ref3[1],
                      value = _ref3$ === void 0 ? {} : _ref3$;

                  if (!value[position]) {
                    return Promise.resolve(_this);
                  }

                  return transition(_this.$refs[refName], {
                    from: value[_this.position],
                    to: value[position]
                  }, 'keep');
                })).then(function () {
                  _this.position = position;
                  return Promise.resolve(_this);
                }));

              case 5:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function setPosition(_x2) {
        return _setPosition.apply(this, arguments);
      }

      return setPosition;
    }()
    /**
     * Open the tooltip.
     *
     * @return {Tooltip} The Tooltip instance.
     */

  }, {
    key: "open",
    value: function () {
      var _open = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5() {
        var _this2 = this;

        var _findBestPosition, x, position;

        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!this.isOpen) {
                  _context5.next = 2;
                  break;
                }

                return _context5.abrupt("return", Promise.resolve(this));

              case 2:
                this.$refs.container.setAttribute('aria-hidden', 'false');
                this.isOpen = true;
                this.$emit('open');
                _findBestPosition = findBestPosition(this.$refs.content, this.$options.offset), x = _findBestPosition.x, position = _findBestPosition.y;

                if (x !== null) {
                  styles.add(this.$refs.content, {
                    marginLeft: "".concat(x, "px")
                  });
                }

                _context5.next = 9;
                return this.setPosition(position);

              case 9:
                return _context5.abrupt("return", Promise.all(Object.entries(this.$options.styles).map(function (_ref4) {
                  var _ref5 = _slicedToArray(_ref4, 2),
                      refName = _ref5[0],
                      _ref5$ = _ref5[1];

                  _ref5$ = _ref5$ === void 0 ? {} : _ref5$;
                  var open = _ref5$.open,
                      active = _ref5$.active,
                      closed = _ref5$.closed;
                  return transition(_this2.$refs[refName], {
                    from: closed,
                    active: active,
                    to: open
                  }, 'keep');
                })).then(function () {
                  return Promise.resolve(_this2);
                }));

              case 10:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function open() {
        return _open.apply(this, arguments);
      }

      return open;
    }()
    /**
     * Close the tooltip.
     *
     * @return {Tooltip} The Tooltip instance.
     */

  }, {
    key: "close",
    value: function () {
      var _close = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee7() {
        var _this3 = this;

        return _regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (!(this.isOpen === false || this.isOpen === true && this.$options.isOpen)) {
                  _context7.next = 2;
                  break;
                }

                return _context7.abrupt("return", Promise.resolve(this));

              case 2:
                this.isOpen = false;
                return _context7.abrupt("return", Promise.all(Object.entries(this.$options.styles).map(function (_ref6) {
                  var _ref7 = _slicedToArray(_ref6, 2),
                      refName = _ref7[0],
                      _ref7$ = _ref7[1];

                  _ref7$ = _ref7$ === void 0 ? {} : _ref7$;
                  var open = _ref7$.open,
                      active = _ref7$.active,
                      closed = _ref7$.closed;
                  return transition(_this3.$refs[refName], {
                    from: open,
                    active: active,
                    to: closed
                  }, 'keep');
                })).then( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6() {
                  return _regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                      switch (_context6.prev = _context6.next) {
                        case 0:
                          _context6.next = 2;
                          return _this3.setPosition('top');

                        case 2:
                          _this3.$emit('close');

                          _this3.$refs.container.setAttribute('aria-hidden', 'true');

                          return _context6.abrupt("return", Promise.resolve(_this3));

                        case 5:
                        case "end":
                          return _context6.stop();
                      }
                    }
                  }, _callee6);
                }))));

              case 4:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function close() {
        return _close.apply(this, arguments);
      }

      return close;
    }()
  }, {
    key: "config",

    /**
     * Tooltip options.
     */
    get: function get() {
      return {
        name: 'Tooltip',
        offset: 0,
        isOpen: false,
        styles: {
          container: {
            closed: {
              opacity: 0,
              pointerEvents: 'none'
            },
            top: {
              bottom: '100%',
              left: '50%'
            },
            bottom: {
              top: '100%',
              bottom: 'auto',
              left: '50%'
            }
          },
          content: {
            top: {
              top: 'auto',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)'
            },
            bottom: {
              top: 0,
              bottom: 'auto',
              left: '50%',
              transform: 'translateX(-50%)'
            }
          }
        }
      };
    }
    /**
     * Switch tooltip on trigger focus.
     *
     * @return {Function}
     */

  }, {
    key: "onTriggerFocus",
    get: function get() {
      return this.open;
    }
    /**
     * Switch tooltip on trigger blur.
     *
     * @return {Function}
     */

  }, {
    key: "onTriggerBlur",
    get: function get() {
      return this.close;
    }
    /**
     * Switch tooltip on mouseenter.
     *
     * @return {Function}
     */

  }, {
    key: "onMouseenter",
    get: function get() {
      return this.open;
    }
    /**
     * Switch tooltip on mouseleave.
     *
     * @return {Function}
     */

  }, {
    key: "onMouseleave",
    get: function get() {
      return this.close;
    }
  }]);

  return Tooltip;
}(Base);

export { Tooltip as default };
//# sourceMappingURL=Tooltip.js.map