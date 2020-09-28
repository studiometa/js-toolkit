import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import Base from '../abstracts/Base';
import transition from '../utils/css/transition';
import focusTrap from '../utils/focusTrap';

var _focusTrap = focusTrap(),
    trap = _focusTrap.trap,
    untrap = _focusTrap.untrap,
    saveActiveElement = _focusTrap.saveActiveElement;
/**
 * Modal class.
 */


var Modal = /*#__PURE__*/function (_Base) {
  _inherits(Modal, _Base);

  var _super = _createSuper(Modal);

  function Modal() {
    _classCallCheck(this, Modal);

    return _super.apply(this, arguments);
  }

  _createClass(Modal, [{
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
            var _ref2 = _slicedToArray(_ref, 2),
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
    value: function () {
      var _open = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
        var _this = this;

        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.isOpen) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", Promise.resolve(this));

              case 2:
                this.$refs.modal.setAttribute('aria-hidden', 'false');
                document.documentElement.style.overflow = 'hidden';
                this.isOpen = true;
                this.$emit('open');
                return _context.abrupt("return", Promise.all(Object.entries(this.$options.styles).map(function (_ref4) {
                  var _ref5 = _slicedToArray(_ref4, 2),
                      refName = _ref5[0],
                      _ref5$ = _ref5[1];

                  _ref5$ = _ref5$ === void 0 ? {} : _ref5$;
                  var open = _ref5$.open,
                      active = _ref5$.active,
                      closed = _ref5$.closed;
                  return transition(_this.$refs[refName], {
                    from: closed,
                    active: active,
                    to: open
                  }, 'keep');
                })).then(function () {
                  if (_this.$options.autofocus && _this.$refs.modal.querySelector(_this.$options.autofocus)) {
                    saveActiveElement();

                    _this.$refs.modal.querySelector(_this.$options.autofocus).focus();
                  }

                  return Promise.resolve(_this);
                }));

              case 7:
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
     * Close the modal.
     *
     * @return {Modal} The Modal instance.
     */

  }, {
    key: "close",
    value: function () {
      var _close = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
        var _this2 = this;

        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this.isOpen) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt("return", Promise.resolve(this));

              case 2:
                this.$refs.modal.setAttribute('aria-hidden', 'true');
                document.documentElement.style.overflow = '';
                this.isOpen = false;
                untrap();
                this.$emit('close');
                return _context2.abrupt("return", Promise.all(Object.entries(this.$options.styles).map(function (_ref6) {
                  var _ref7 = _slicedToArray(_ref6, 2),
                      refName = _ref7[0],
                      _ref7$ = _ref7[1];

                  _ref7$ = _ref7$ === void 0 ? {} : _ref7$;
                  var open = _ref7$.open,
                      active = _ref7$.active,
                      closed = _ref7$.closed;
                  return transition(_this2.$refs[refName], {
                    from: open,
                    active: active,
                    to: closed
                  }, 'keep');
                })).then(function () {
                  return Promise.resolve(_this2);
                }));

              case 8:
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
     * Modal options.
     */
    get: function get() {
      return {
        name: 'Modal',
        move: false,
        autofocus: '[autofocus]',
        styles: {
          modal: {
            closed: {
              opacity: 0,
              pointerEvents: 'none',
              visibility: 'hidden'
            }
          }
        }
      };
    }
    /**
     * Open the modal on click on the `open` ref.
     *
     * @return {Function} The component's `open` method.
     */

  }, {
    key: "onOpenClick",
    get: function get() {
      return this.open;
    }
    /**
     * Close the modal on click on the `close` ref.
     *
     * @return {Function} The component's `close` method.
     */

  }, {
    key: "onCloseClick",
    get: function get() {
      return this.close;
    }
    /**
     * Close the modal on click on the `overlay` ref.
     *
     * @return {Function} The component's `close` method.
     */

  }, {
    key: "onOverlayClick",
    get: function get() {
      return this.close;
    }
  }]);

  return Modal;
}(Base);

export { Modal as default };
//# sourceMappingURL=Modal.js.map