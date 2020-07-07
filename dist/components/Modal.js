"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _Base2 = _interopRequireDefault(require("../abstracts/Base"));

var _setClasses = _interopRequireDefault(require("../utils/setClasses"));

var _setStyles = _interopRequireDefault(require("../utils/setStyles"));

var _focusTrap2 = _interopRequireDefault(require("../utils/focusTrap"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var _focusTrap = (0, _focusTrap2.default)(),
    trap = _focusTrap.trap,
    untrap = _focusTrap.untrap,
    saveActiveElement = _focusTrap.saveActiveElement;
/**
 * Modal class.
 */


var Modal = /*#__PURE__*/function (_Base) {
  (0, _inherits2.default)(Modal, _Base);

  var _super = _createSuper(Modal);

  function Modal() {
    (0, _classCallCheck2.default)(this, Modal);
    return _super.apply(this, arguments);
  }

  (0, _createClass2.default)(Modal, [{
    key: "mounted",

    /**
     * Initialize the component's behaviours.
     *
     * @return {Modal} The current instance.
     */
    value: function mounted() {
      this.isOpen = false;
      this.close();

      if (this.$options.move) {
        var target = document.querySelector(this.$options.move) || document.body;
        var refsBackup = this.$refs;
        this.refModalPlaceholder = document.createComment('');
        this.refModalParentBackup = this.$refs.modal.parentElement || this.$el;
        this.refModalParentBackup.insertBefore(this.refModalPlaceholder, this.$refs.modal);
        this.refModalUnbindGetRefFilter = this.$on('get:refs', function (refs) {
          Object.entries(refsBackup).forEach(function (_ref) {
            var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
                key = _ref2[0],
                ref = _ref2[1];

            if (!refs[key]) {
              refs[key] = ref;
            }
          });
        });
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
      this.close();

      if (this.$options.move) {
        this.refModalParentBackup.insertBefore(this.$refs.modal, this.refModalPlaceholder);
        this.refModalUnbindGetRefFilter();
        this.refModalPlaceholder.remove();
        delete this.refModalPlaceholder;
        delete this.refModalParentBackup;
        delete this.refModalUnbindGetRefFilter;
      }

      return this;
    }
    /**
     * Close the modal on `ESC` and trap the tabulation.
     *
     * @param  {KeyboardEvent} options.event  The original keyboard event
     * @param  {Boolean}       options.isUp   Is it a keyup event?
     * @param  {Boolean}       options.isDown Is it a keydown event?
     * @param  {Boolean}       options.ESC    Is it the ESC key?
     * @return {void}
     */

  }, {
    key: "keyed",
    value: function keyed(_ref3) {
      var event = _ref3.event,
          isUp = _ref3.isUp,
          isDown = _ref3.isDown,
          ESC = _ref3.ESC;

      if (!this.isOpen) {
        return;
      }

      if (isDown) {
        trap(this.$refs.modal, event);
      }

      if (ESC && isUp) {
        this.close();
      }
    }
    /**
     * Open the modal.
     *
     * @return {Modal} The Modal instance.
     */

  }, {
    key: "open",
    value: function open() {
      var _this = this;

      this.$refs.modal.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden'; // Add "open" classes to refs

      Object.entries(this.$options.openClass).forEach(function (_ref4) {
        var _ref5 = (0, _slicedToArray2.default)(_ref4, 2),
            ref = _ref5[0],
            classes = _ref5[1];

        (0, _setClasses.default)(_this.$refs[ref], classes);
      }); // Add "open" styles to refs

      Object.entries(this.$options.openStyle).forEach(function (_ref6) {
        var _ref7 = (0, _slicedToArray2.default)(_ref6, 2),
            ref = _ref7[0],
            styles = _ref7[1];

        (0, _setStyles.default)(_this.$refs[ref], styles);
      }); // Remove "closed" classes from refs

      Object.entries(this.$options.closedClass).forEach(function (_ref8) {
        var _ref9 = (0, _slicedToArray2.default)(_ref8, 2),
            ref = _ref9[0],
            classes = _ref9[1];

        (0, _setClasses.default)(_this.$refs[ref], classes, 'remove');
      }); // Remove "closed" styles from refs

      Object.entries(this.$options.closedStyle).forEach(function (_ref10) {
        var _ref11 = (0, _slicedToArray2.default)(_ref10, 2),
            ref = _ref11[0],
            styles = _ref11[1];

        (0, _setStyles.default)(_this.$refs[ref], styles, 'remove');
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
      var _this2 = this;

      this.$refs.modal.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = ''; // Add "closed" classes to refs

      Object.entries(this.$options.closedClass).forEach(function (_ref12) {
        var _ref13 = (0, _slicedToArray2.default)(_ref12, 2),
            ref = _ref13[0],
            classes = _ref13[1];

        (0, _setClasses.default)(_this2.$refs[ref], classes);
      }); // Add "closed" styles to refs

      Object.entries(this.$options.closedStyle).forEach(function (_ref14) {
        var _ref15 = (0, _slicedToArray2.default)(_ref14, 2),
            ref = _ref15[0],
            styles = _ref15[1];

        (0, _setStyles.default)(_this2.$refs[ref], styles);
      }); // Remove "open" classes from refs

      Object.entries(this.$options.openClass).forEach(function (_ref16) {
        var _ref17 = (0, _slicedToArray2.default)(_ref16, 2),
            ref = _ref17[0],
            classes = _ref17[1];

        (0, _setClasses.default)(_this2.$refs[ref], classes, 'remove');
      }); // Remove "open" styles from refs

      Object.entries(this.$options.openStyle).forEach(function (_ref18) {
        var _ref19 = (0, _slicedToArray2.default)(_ref18, 2),
            ref = _ref19[0],
            styles = _ref19[1];

        (0, _setStyles.default)(_this2.$refs[ref], styles, 'remove');
      });
      this.isOpen = false;
      untrap();
      this.$emit('close');
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
  }, {
    key: "onOpenClick",
    get: function get() {
      return this.open;
    }
  }, {
    key: "onCloseClick",
    get: function get() {
      return this.close;
    }
  }, {
    key: "onOverlayClick",
    get: function get() {
      return this.close;
    }
  }]);
  return Modal;
}(_Base2.default);

exports.default = Modal;
//# sourceMappingURL=Modal.js.map