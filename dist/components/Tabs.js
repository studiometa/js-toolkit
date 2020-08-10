"use strict";

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

var _Base2 = _interopRequireDefault(require("../abstracts/Base"));

var _transition = _interopRequireDefault(require("../utils/css/transition"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * Tabs class.
 */
var Tabs = /*#__PURE__*/function (_Base) {
  (0, _inherits2.default)(Tabs, _Base);

  var _super = _createSuper(Tabs);

  function Tabs() {
    (0, _classCallCheck2.default)(this, Tabs);
    return _super.apply(this, arguments);
  }

  (0, _createClass2.default)(Tabs, [{
    key: "mounted",

    /**
     * Initialize the component's behaviours.
     *
     * @return {Tabs} The current instance.
     */
    value: function mounted() {
      var _this = this;

      this.items = this.$refs.btn.map(function (btn, index) {
        var id = "".concat(_this.$id, "-").concat(index);
        var content = _this.$refs.content[index];
        btn.setAttribute('id', id);
        content.setAttribute('aria-labelledby', id);
        var item = {
          btn: btn,
          content: content,
          isEnabled: index > 0
        };

        if (index > 0) {
          _this.disableItem(item);
        } else {
          _this.enableItem(item);
        }

        return item;
      });
      return this;
    }
    /**
     * Switch tab on button click.
     *
     * @param  {Event}  event The click event object.
     * @param  {Number} index The index of the clicked button.
     * @return {void}
     */

  }, {
    key: "onBtnClick",
    value: function onBtnClick(event, index) {
      var _this2 = this;

      this.items.forEach(function (item, i) {
        if (i !== index) {
          _this2.disableItem(item);
        }
      });
      this.enableItem(this.items[index]);
    }
    /**
     * Enable the given tab and its associated content.
     *
     * @param  {HTMLElement} btn     The tab element.
     * @param  {HTMLElement} content The content element.
     * @return {Tabs}                The Tabs instance.
     */

  }, {
    key: "enableItem",
    value: function () {
      var _enableItem = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(item) {
        var _this3 = this;

        var btn, content, btnStyles, contentStyles;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(!item || item.isEnabled)) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", Promise.resolve(this));

              case 2:
                item.isEnabled = true;
                btn = item.btn, content = item.content;
                btnStyles = this.$options.styles.btn || {};
                contentStyles = this.$options.styles.content || {};
                content.setAttribute('aria-hidden', 'false');
                this.$emit('enable', item);
                return _context.abrupt("return", Promise.all([(0, _transition.default)(btn, {
                  from: btnStyles.closed,
                  active: btnStyles.active,
                  to: btnStyles.open
                }, 'keep'), (0, _transition.default)(content, {
                  from: contentStyles.closed,
                  active: contentStyles.active,
                  to: contentStyles.open
                }, 'keep')]).then(function () {
                  return Promise.resolve(_this3);
                }));

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function enableItem(_x) {
        return _enableItem.apply(this, arguments);
      }

      return enableItem;
    }()
    /**
     * Disable the given tab and its associated content.
     *
     * @param  {HTMLElement} btn     The tab element.
     * @param  {HTMLElement} content The content element.
     * @return {Tabs}                The Tabs instance.
     */

  }, {
    key: "disableItem",
    value: function () {
      var _disableItem = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(item) {
        var _this4 = this;

        var btn, content, btnStyles, contentStyles;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(!item || !item.isEnabled)) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt("return", Promise.resolve(this));

              case 2:
                item.isEnabled = false;
                btn = item.btn, content = item.content;
                btnStyles = this.$options.styles.btn || {};
                contentStyles = this.$options.styles.content || {};
                content.setAttribute('aria-hidden', 'true');
                this.$emit('disable', item);
                return _context2.abrupt("return", Promise.all([(0, _transition.default)(btn, {
                  from: btnStyles.open,
                  active: btnStyles.active,
                  to: btnStyles.closed
                }, 'keep'), (0, _transition.default)(content, {
                  from: contentStyles.open,
                  active: contentStyles.active,
                  to: contentStyles.closed
                }, 'keep')]).then(function () {
                  return Promise.resolve(_this4);
                }));

              case 9:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function disableItem(_x2) {
        return _disableItem.apply(this, arguments);
      }

      return disableItem;
    }()
  }, {
    key: "config",

    /**
     * Tabs options.
     */
    get: function get() {
      return {
        name: 'Tabs',
        styles: {
          content: {
            closed: {
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
              visibility: 'hidden'
            }
          }
        }
      };
    }
  }]);
  return Tabs;
}(_Base2.default);

exports.default = Tabs;
//# sourceMappingURL=Tabs.js.map