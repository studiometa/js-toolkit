"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _Base2 = _interopRequireDefault(require("../../abstracts/Base"));

var classes = _interopRequireWildcard(require("../../utils/css/classes"));

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
        var height;
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
                classes.remove(this.$refs.container, 'invisible');
                height = this.$refs.content.offsetHeight;
                _context.next = 10;
                return (0, _transition.default)(this.$refs.container, {
                  from: {
                    height: 0
                  },
                  active: this.$options.enterActive || this.$options.active,
                  to: {
                    height: "".concat(height, "px")
                  }
                });

              case 10:
                classes.remove(this.$refs.container, 'h-0');
                classes.remove(this.$refs.content, 'absolute');

              case 12:
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
        var height;
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
                height = this.$refs.content.offsetHeight;
                classes.add(this.$refs.content, 'absolute');
                _context2.next = 9;
                return (0, _transition.default)(this.$refs.container, {
                  from: {
                    height: "".concat(height, "px")
                  },
                  active: this.$options.leaveActive || this.$options.active,
                  to: 'h-0'
                });

              case 9:
                classes.add(this.$refs.container, 'h-0');
                classes.add(this.$refs.container, 'invisible');
                this.$refs.container.setAttribute('aria-hidden', 'true');

              case 12:
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
        active: '',
        enterActive: '',
        leaveActive: ''
      };
    }
  }]);
  return AccordionItem;
}(_Base2.default);

exports.default = AccordionItem;
//# sourceMappingURL=AccordionItem.js.map