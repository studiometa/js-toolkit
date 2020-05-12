"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _abstracts = require("../abstracts");

var _utils = require("../utils");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function () { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var _tabTrap = (0, _utils.tabTrap)(),
    trap = _tabTrap.trap,
    untrap = _tabTrap.untrap,
    saveActiveElement = _tabTrap.saveActiveElement;
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
 * Modal class.
 */


var Modal = /*#__PURE__*/function (_Base) {
  (0, _inherits2["default"])(Modal, _Base);

  var _super = _createSuper(Modal);

  function Modal() {
    (0, _classCallCheck2["default"])(this, Modal);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(Modal, [{
    key: "mounted",

    /**
     * Initialize the component's behaviours.
     *
     * @return {Modal} The current instance.
     */
    value: function mounted() {
      var _this = this;

      this.isOpen = false;
      var open = Array.isArray(this.$refs.open) ? this.$refs.open : [this.$refs.open];
      open.forEach(function (btn) {
        return btn.addEventListener('click', _this.open);
      });
      var close = Array.isArray(this.$refs.close) ? this.$refs.close : [this.$refs.close];
      close.forEach(function (btn) {
        return btn.addEventListener('click', _this.close);
      });
      this.$refs.overlay.addEventListener('click', this.close);
      this.close();

      if (this.$options.move) {
        var target = document.querySelector(this.$options.move) || document.body;
        target.appendChild(this.$refs.modal);
      }

      return this;
    }
    /**
     * Unbind all events on destroy.
     *
     * @return {Modal} The Modal instance.
     */

  }, {
    key: "destroyed",
    value: function destroyed() {
      var _this2 = this;

      this.close();
      var open = Array.isArray(this.$refs.open) ? this.$refs.open : [this.$refs.open];
      open.forEach(function (btn) {
        return btn.removeEventListener('click', _this2.open);
      });
      var close = Array.isArray(this.$refs.close) ? this.$refs.close : [this.$refs.close];
      close.forEach(function (btn) {
        return btn.removeEventListener('click', _this2.close);
      });
      this.$refs.overlay.removeEventListener('click', this.close);
      return this;
    }
    /**
     * Open the modal.
     *
     * @return {Modal} The Modal instance.
     */

  }, {
    key: "open",
    value: function open() {
      var _this3 = this;

      this.$refs.modal.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
      document.addEventListener('keydown', this.keydownHandler); // Add "open" classes to refs

      Object.entries(this.$options.openClass).forEach(function (_ref3) {
        var _ref4 = (0, _slicedToArray2["default"])(_ref3, 2),
            ref = _ref4[0],
            classes = _ref4[1];

        setClasses(_this3.$refs[ref], classes);
      }); // Add "open" styles to refs

      Object.entries(this.$options.openStyle).forEach(function (_ref5) {
        var _ref6 = (0, _slicedToArray2["default"])(_ref5, 2),
            ref = _ref6[0],
            styles = _ref6[1];

        setStyles(_this3.$refs[ref], styles);
      }); // Remove "closed" classes from refs

      Object.entries(this.$options.closedClass).forEach(function (_ref7) {
        var _ref8 = (0, _slicedToArray2["default"])(_ref7, 2),
            ref = _ref8[0],
            classes = _ref8[1];

        setClasses(_this3.$refs[ref], classes, 'remove');
      }); // Remove "closed" styles from refs

      Object.entries(this.$options.closedStyle).forEach(function (_ref9) {
        var _ref10 = (0, _slicedToArray2["default"])(_ref9, 2),
            ref = _ref10[0],
            styles = _ref10[1];

        setStyles(_this3.$refs[ref], styles, 'remove');
      });

      if (this.$options.autofocus && this.$refs.modal.querySelector(this.$options.autofocus)) {
        saveActiveElement();
        this.$refs.modal.querySelector(this.$options.autofocus).focus();
      }

      this.isOpen = true;
      this.$emit('open');
    }
    /**
     * Close the modal.
     *
     * @return {Modal} The Modal instance.
     */

  }, {
    key: "close",
    value: function close() {
      var _this4 = this;

      this.$refs.modal.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      document.removeEventListener('keydown', this.keydownHandler); // Add "closed" classes to refs

      Object.entries(this.$options.closedClass).forEach(function (_ref11) {
        var _ref12 = (0, _slicedToArray2["default"])(_ref11, 2),
            ref = _ref12[0],
            classes = _ref12[1];

        setClasses(_this4.$refs[ref], classes);
      }); // Add "closed" styles to refs

      Object.entries(this.$options.closedStyle).forEach(function (_ref13) {
        var _ref14 = (0, _slicedToArray2["default"])(_ref13, 2),
            ref = _ref14[0],
            styles = _ref14[1];

        setStyles(_this4.$refs[ref], styles);
      }); // Remove "open" classes from refs

      Object.entries(this.$options.openClass).forEach(function (_ref15) {
        var _ref16 = (0, _slicedToArray2["default"])(_ref15, 2),
            ref = _ref16[0],
            classes = _ref16[1];

        setClasses(_this4.$refs[ref], classes, 'remove');
      }); // Remove "open" styles from refs

      Object.entries(this.$options.openStyle).forEach(function (_ref17) {
        var _ref18 = (0, _slicedToArray2["default"])(_ref17, 2),
            ref = _ref18[0],
            styles = _ref18[1];

        setStyles(_this4.$refs[ref], styles, 'remove');
      });
      this.isOpen = false;
      untrap();
      this.$emit('close');
    }
    /**
     * Manage closing the modal on `ESC` keydown and trapped tabulation.
     *
     * @param  {Event} event The event object.
     * @return {Modal}       The Modal instance.
     */

  }, {
    key: "keydownHandler",
    value: function keydownHandler(event) {
      if (event.keyCode === _utils.keyCodes.ESC) {
        return this.close();
      } // Trap tab navigation


      trap(this.$refs.modal, event);
      return this;
    }
  }, {
    key: "config",

    /**
     * Modal options.
     */
    get: function get() {
      return {
        name: 'Modal',
        move: false,
        autofocus: '[autofocus]',
        openClass: {},
        openStyle: {},
        closedClass: {},
        closedStyle: {
          modal: {
            opacity: 0,
            pointerEvents: 'none',
            visibility: 'hidden'
          }
        }
      };
    }
  }]);
  return Modal;
}(_abstracts.Base);

exports["default"] = Modal;
//# sourceMappingURL=Modal.js.map