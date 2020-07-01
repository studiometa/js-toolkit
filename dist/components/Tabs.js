"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _Base2 = _interopRequireDefault(require("../abstracts/Base"));

var _setClasses = _interopRequireDefault(require("../utils/setClasses"));

var _setStyles = _interopRequireDefault(require("../utils/setStyles"));

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

        if (index === 0) {
          _this.enableTab(btn, content);
        } else {
          _this.disableTab(btn, content);
        }

        var clickHandler = function clickHandler() {
          _this.$refs.btn.forEach(function (el, i) {
            if (i !== index) {
              _this.disableTab(el, _this.$refs.content[i]);
            }
          });

          _this.enableTab(btn, content);
        };

        btn.addEventListener('click', clickHandler);
        return {
          btn: btn,
          clickHandler: clickHandler
        };
      });
      return this;
    }
    /**
     * Unbind all events on destroy.
     *
     * @return {Tabs} The Tabs instance.
     */

  }, {
    key: "destroyed",
    value: function destroyed() {
      this.items.forEach(function (_ref) {
        var btn = _ref.btn,
            clickHandler = _ref.clickHandler;
        btn.removeEventListener('click', clickHandler);
      });
      return this;
    }
    /**
     * Enable the given tab and its associated content.
     *
     * @param  {HTMLElement} btn     The tab element.
     * @param  {HTMLElement} content The content element.
     * @return {Tabs}                The Tabs instance.
     */

  }, {
    key: "enableTab",
    value: function enableTab(btn, content) {
      (0, _setClasses.default)(btn, this.$options.tabActiveClass);
      (0, _setStyles.default)(btn, this.$options.tabActiveStyle);
      (0, _setClasses.default)(content, this.$options.contentActiveClass);
      (0, _setStyles.default)(content, this.$options.contentActiveStyle);
      (0, _setClasses.default)(btn, this.$options.tabInactiveClass, 'remove');
      (0, _setStyles.default)(btn, this.$options.tabInactiveStyle, 'remove');
      (0, _setClasses.default)(content, this.$options.contentInactiveClass, 'remove');
      (0, _setStyles.default)(content, this.$options.contentInactiveStyle, 'remove');
      content.setAttribute('aria-hidden', 'false');
      this.$emit('enable', {
        btn: btn,
        content: content
      });
      return this;
    }
    /**
     * Disable the given tab and its associated content.
     *
     * @param  {HTMLElement} btn     The tab element.
     * @param  {HTMLElement} content The content element.
     * @return {Tabs}                The Tabs instance.
     */

  }, {
    key: "disableTab",
    value: function disableTab(btn, content) {
      (0, _setClasses.default)(btn, this.$options.tabActiveClass, 'remove');
      (0, _setStyles.default)(btn, this.$options.tabActiveStyle, 'remove');
      (0, _setClasses.default)(content, this.$options.contentActiveClass, 'remove');
      (0, _setStyles.default)(content, this.$options.contentActiveStyle, 'remove');
      (0, _setClasses.default)(btn, this.$options.tabInactiveClass);
      (0, _setStyles.default)(btn, this.$options.tabInactiveStyle);
      (0, _setClasses.default)(content, this.$options.contentInactiveClass);
      (0, _setStyles.default)(content, this.$options.contentInactiveStyle);
      content.setAttribute('aria-hidden', 'true');
      this.$emit('disable', {
        btn: btn,
        content: content
      });
      return this;
    }
  }, {
    key: "config",

    /**
     * Tabs options.
     */
    get: function get() {
      return {
        name: 'Tabs',
        tabActiveClass: '',
        tabActiveStyle: {},
        tabInactiveClass: '',
        tabInactiveStyle: {},
        contentActiveClass: '',
        contentActiveStyle: {},
        contentInactiveClass: '',
        contentInactiveStyle: {
          display: 'none'
        }
      };
    }
  }]);
  return Tabs;
}(_Base2.default);

exports.default = Tabs;
//# sourceMappingURL=Tabs.js.map