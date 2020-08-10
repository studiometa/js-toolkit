"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _Base2 = _interopRequireDefault(require("../../abstracts/Base"));

var styles = _interopRequireWildcard(require("../../utils/css/styles"));

var _transition = _interopRequireDefault(require("../../utils/css/transition"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * AccordionItem class.
 */
var AccordionItem = /*#__PURE__*/function (_Base) {
  (0, _inherits2.default)(AccordionItem, _Base);

  var _super = _createSuper(AccordionItem);

  function AccordionItem() {
    (0, _classCallCheck2.default)(this, AccordionItem);
    return _super.apply(this, arguments);
  }

  (0, _createClass2.default)(AccordionItem, [{
    key: "mounted",

    /**
     * Add aria-attributes on mounted.
     * @return {void}
     */
    value: function mounted() {
      this.$refs.btn.setAttribute('id', this.$id);
      this.$refs.content.setAttribute('aria-labelledby', this.$id);
      this.isOpen = this.$options.isOpen;

      if (!this.isOpen) {
        styles.add(this.$refs.container, {
          visibility: 'invisible',
          height: 0
        });
      }
    }
    /**
     * Handler for the click event on the `btn` ref.
     * @return {void}
     */

  }, {
    key: "onBtnClick",
    value: function onBtnClick() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
    /**
     * Open an item.
     * @return {void}
     */

  }, {
    key: "open",
    value: function () {
      var _open = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
        var _this = this;

        var _this$$options$styles, container, otherStyles;

        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.isOpen) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return");

              case 2:
                this.$log('open');
                this.$emit('open');
                this.isOpen = true;
                this.$refs.container.setAttribute('aria-hidden', 'false');
                styles.remove(this.$refs.container, {
                  visibility: 'invisible'
                });
                _this$$options$styles = this.$options.styles, container = _this$$options$styles.container, otherStyles = (0, _objectWithoutProperties2.default)(_this$$options$styles, ["container"]);
                _context.next = 10;
                return Promise.all([(0, _transition.default)(this.$refs.container, {
                  from: {
                    height: 0
                  },
                  active: container.active,
                  to: {
                    height: "".concat(this.$refs.content.offsetHeight, "px")
                  }
                }).then(function () {
                  // Remove style only if the item has not been closed before the end
                  if (_this.isOpen) {
                    styles.remove(_this.$refs.content, {
                      position: 'absolute'
                    });
                  }

                  return Promise.resolve();
                })].concat((0, _toConsumableArray2.default)(Object.entries(otherStyles).filter(function (_ref) {
                  var _ref2 = (0, _slicedToArray2.default)(_ref, 1),
                      refName = _ref2[0];

                  return _this.$refs[refName];
                }).map(function (_ref3) {
                  var _ref4 = (0, _slicedToArray2.default)(_ref3, 2),
                      refName = _ref4[0],
                      _ref4$ = _ref4[1];

                  _ref4$ = _ref4$ === void 0 ? {} : _ref4$;
                  var open = _ref4$.open,
                      active = _ref4$.active,
                      closed = _ref4$.closed;
                  return (0, _transition.default)(_this.$refs[refName], {
                    from: closed,
                    active: active,
                    to: open
                  }, 'keep');
                }))));

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function open() {
        return _open.apply(this, arguments);
      }

      return open;
    }()
    /**
     * Close an item.
     * @return {void}
     */

  }, {
    key: "close",
    value: function () {
      var _close = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
        var _this2 = this;

        var height, _this$$options$styles2, container, otherStyles;

        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this.isOpen) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt("return");

              case 2:
                this.$log('close');
                this.$emit('close');
                this.isOpen = false;
                height = this.$refs.container.offsetHeight;
                styles.add(this.$refs.content, {
                  position: 'absolute'
                });
                _this$$options$styles2 = this.$options.styles, container = _this$$options$styles2.container, otherStyles = (0, _objectWithoutProperties2.default)(_this$$options$styles2, ["container"]);
                _context2.next = 10;
                return Promise.all([(0, _transition.default)(this.$refs.container, {
                  from: {
                    height: "".concat(height, "px")
                  },
                  active: container.active,
                  to: {
                    height: 0
                  }
                }).then(function () {
                  // Add end styles only if the item has not been re-opened before the end
                  if (!_this2.isOpen) {
                    styles.add(_this2.$refs.container, {
                      height: 0,
                      visibility: 'invisible'
                    });

                    _this2.$refs.container.setAttribute('aria-hidden', 'true');
                  }

                  return Promise.resolve();
                })].concat((0, _toConsumableArray2.default)(Object.entries(otherStyles).filter(function (_ref5) {
                  var _ref6 = (0, _slicedToArray2.default)(_ref5, 1),
                      refName = _ref6[0];

                  return _this2.$refs[refName];
                }).map(function (_ref7) {
                  var _ref8 = (0, _slicedToArray2.default)(_ref7, 2),
                      refName = _ref8[0],
                      _ref8$ = _ref8[1];

                  _ref8$ = _ref8$ === void 0 ? {} : _ref8$;
                  var open = _ref8$.open,
                      active = _ref8$.active,
                      closed = _ref8$.closed;
                  return (0, _transition.default)(_this2.$refs[refName], {
                    from: open,
                    active: active,
                    to: closed
                  }, 'keep');
                }))));

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function close() {
        return _close.apply(this, arguments);
      }

      return close;
    }()
  }, {
    key: "config",

    /**
     * AccordionItem config
     * @return {Object}
     */
    get: function get() {
      return {
        name: 'AccordionItem',
        isOpen: false,
        styles: {
          container: {
            open: '',
            active: '',
            closed: ''
          }
        }
      };
    }
  }]);
  return AccordionItem;
}(_Base2.default);

exports.default = AccordionItem;
//# sourceMappingURL=AccordionItem.js.map