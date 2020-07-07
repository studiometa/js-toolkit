"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var classes = _interopRequireWildcard(require("../utils/css/classes"));

var styles = _interopRequireWildcard(require("../utils/css/styles"));

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

      this.$refs.btn.forEach(function (btn, index) {
        var id = "".concat(_this.$id, "-").concat(index);
        var content = _this.$refs.content[index];
        btn.setAttribute('id', id);
        content.setAttribute('aria-labelledby', id);

        if (index === 0) {
          _this.enableTab(btn, content);
        } else {
          _this.disableTab(btn, content);
        }
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

      this.$refs.btn.filter(function (el, i) {
        return i !== index;
      }).forEach(function (el, i) {
        _this2.disableTab(el, _this2.$refs.content[i]);
      });
      this.enableTab(this.$refs.btn[index], this.$refs.content[index]);
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
      classes.add(btn, this.$options.tabActiveClass);
      styles.add(btn, this.$options.tabActiveStyle);
      classes.add(content, this.$options.contentActiveClass);
      styles.add(content, this.$options.contentActiveStyle);
      classes.remove(btn, this.$options.tabInactiveClass);
      styles.remove(btn, this.$options.tabInactiveStyle);
      classes.remove(content, this.$options.contentInactiveClass);
      styles.remove(content, this.$options.contentInactiveStyle);
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
      classes.remove(btn, this.$options.tabActiveClass);
      styles.remove(btn, this.$options.tabActiveStyle);
      classes.remove(content, this.$options.contentActiveClass);
      styles.remove(content, this.$options.contentActiveStyle);
      classes.add(btn, this.$options.tabInactiveClass);
      styles.add(btn, this.$options.tabInactiveStyle);
      classes.add(content, this.$options.contentInactiveClass);
      styles.add(content, this.$options.contentInactiveStyle);
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