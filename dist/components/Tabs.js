"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _abstracts = require("../abstracts");

var _utils = require("../utils");

function _createSuper(Derived) { return function () { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * Manage a list of classes as string on an element.
 *
 * @param {HTMLElement} element    The element to update.
 * @param {String}      classNames A string of class names.
 * @param {String}      method     The method to use: add, remove or toggle.
 */
function setClasses(element, classNames) {
  var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'add';

  if (!element || !classNames) {
    return;
  }

  classNames.split(' ').forEach(function (className) {
    element.classList[method](className);
  });
}
/**
 * Manage a list of style properties on an element.
 *
 * @param {HTMLElement}         element The element to update.
 * @param {CSSStyleDeclaration} styles  An object of styles properties and values.
 * @param {String}              method  The method to use: add or remove.
 */


function setStyles(element, styles) {
  var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'add';

  if (!element || !styles || !(0, _utils.isObject)(styles)) {
    return;
  }

  Object.entries(styles).forEach(function (_ref) {
    var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
        prop = _ref2[0],
        value = _ref2[1];

    element.style[prop] = method === 'add' ? value : '';
  });
}
/**
 * Tabs class.
 */


var Tabs = /*#__PURE__*/function (_Base) {
  (0, _inherits2["default"])(Tabs, _Base);

  var _super = _createSuper(Tabs);

  function Tabs() {
    (0, _classCallCheck2["default"])(this, Tabs);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(Tabs, [{
    key: "mounted",
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
            _this.disableTab(el, _this.$refs.content[i]);
          });

          _this.enableTab(btn, content);
        };

        btn.addEventListener('click', clickHandler);
        return {
          btn: btn,
          clickHandler: clickHandler
        };
      });
    }
  }, {
    key: "enableTab",
    value: function enableTab(btn, content) {
      setClasses(btn, this.$options.tabActiveClass);
      setStyles(btn, this.$options.tabActiveStyle);
      setClasses(content, this.$options.contentActiveClass);
      setStyles(content, this.$options.contentActiveStyle);
      setClasses(btn, this.$options.tabInactiveClass, 'remove');
      setStyles(btn, this.$options.tabInactiveStyle, 'remove');
      setClasses(content, this.$options.contentInactiveClass, 'remove');
      setStyles(content, this.$options.contentInactiveStyle, 'remove');
      content.setAttribute('aria-hidden', 'false');
    }
  }, {
    key: "disableTab",
    value: function disableTab(btn, content) {
      setClasses(btn, this.$options.tabActiveClass, 'remove');
      setStyles(btn, this.$options.tabActiveStyle, 'remove');
      setClasses(content, this.$options.contentActiveClass, 'remove');
      setStyles(content, this.$options.contentActiveStyle, 'remove');
      setClasses(btn, this.$options.tabInactiveClass);
      setStyles(btn, this.$options.tabInactiveStyle);
      setClasses(content, this.$options.contentInactiveClass);
      setStyles(content, this.$options.contentInactiveStyle);
      content.setAttribute('aria-hidden', 'true');
    }
  }, {
    key: "destroyed",
    value: function destroyed() {
      this.items.forEach(function (_ref3) {
        var btn = _ref3.btn,
            clickHandler = _ref3.clickHandler;
        btn.removeEventListener('click', clickHandler);
      });
    }
  }, {
    key: "config",
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
}(_abstracts.Base);

exports["default"] = Tabs;
//# sourceMappingURL=Tabs.js.map