import _regeneratorRuntime from "@babel/runtime/regenerator";
import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/objectWithoutProperties";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import Base from '../../abstracts/Base';
import * as styles from '../../utils/css/styles';
import transition from '../../utils/css/transition';
/**
 * AccordionItem class.
 */

var AccordionItem = /*#__PURE__*/function (_Base) {
  _inherits(AccordionItem, _Base);

  var _super = _createSuper(AccordionItem);

  function AccordionItem() {
    _classCallCheck(this, AccordionItem);

    return _super.apply(this, arguments);
  }

  _createClass(AccordionItem, [{
    key: "mounted",

    /**
     * Add aria-attributes on mounted.
     * @return {void}
     */
    value: function mounted() {
      var _this = this;

      if (this.$parent && this.$parent.$options.item) {
        this.$options = this.$parent.$options.item;
      }

      this.$refs.btn.setAttribute('id', this.$id);
      this.$refs.btn.setAttribute('aria-controls', this.contentId);
      this.$refs.content.setAttribute('aria-labelledby', this.$id);
      this.$refs.content.setAttribute('id', this.contentId);
      this.isOpen = this.$options.isOpen;
      this.updateAttributes(this.isOpen);

      if (!this.isOpen) {
        styles.add(this.$refs.container, {
          visibility: 'invisible',
          height: 0
        });
      } // Update refs styles on mount


      var _this$$options$styles = this.$options.styles,
          container = _this$$options$styles.container,
          otherStyles = _objectWithoutProperties(_this$$options$styles, ["container"]);

      Object.entries(otherStyles).filter(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 1),
            refName = _ref2[0];

        return _this.$refs[refName];
      }).forEach(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            refName = _ref4[0],
            _ref4$ = _ref4[1];

        _ref4$ = _ref4$ === void 0 ? {} : _ref4$;
        var open = _ref4$.open,
            closed = _ref4$.closed;
        transition(_this.$refs[refName], {
          to: _this.isOpen ? open : closed
        }, 'keep');
      });
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
     * Get the content ID.
     * @return {String}
     */

  }, {
    key: "updateAttributes",

    /**
     * Update the refs' attributes according to the given type.
     *
     * @param  {Boolean} isOpen The state of the item.
     * @return {void}
     */
    value: function updateAttributes(isOpen) {
      this.$refs.content.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      this.$refs.btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
    /**
     * Open an item.
     * @return {void}
     */

  }, {
    key: "open",
    value: function () {
      var _open = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
        var _this2 = this;

        var _this$$options$styles2, container, otherStyles;

        return _regeneratorRuntime.wrap(function _callee$(_context) {
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
                this.updateAttributes(this.isOpen);
                styles.remove(this.$refs.container, {
                  visibility: 'invisible'
                });
                _this$$options$styles2 = this.$options.styles, container = _this$$options$styles2.container, otherStyles = _objectWithoutProperties(_this$$options$styles2, ["container"]);
                _context.next = 10;
                return Promise.all([transition(this.$refs.container, {
                  from: {
                    height: 0
                  },
                  active: container.active,
                  to: {
                    height: "".concat(this.$refs.content.offsetHeight, "px")
                  }
                }).then(function () {
                  // Remove style only if the item has not been closed before the end
                  if (_this2.isOpen) {
                    styles.remove(_this2.$refs.content, {
                      position: 'absolute'
                    });
                  }

                  return Promise.resolve();
                })].concat(_toConsumableArray(Object.entries(otherStyles).filter(function (_ref5) {
                  var _ref6 = _slicedToArray(_ref5, 1),
                      refName = _ref6[0];

                  return _this2.$refs[refName];
                }).map(function (_ref7) {
                  var _ref8 = _slicedToArray(_ref7, 2),
                      refName = _ref8[0],
                      _ref8$ = _ref8[1];

                  _ref8$ = _ref8$ === void 0 ? {} : _ref8$;
                  var open = _ref8$.open,
                      active = _ref8$.active,
                      closed = _ref8$.closed;
                  return transition(_this2.$refs[refName], {
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
      var _close = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
        var _this3 = this;

        var height, _this$$options$styles3, container, otherStyles;

        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
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
                _this$$options$styles3 = this.$options.styles, container = _this$$options$styles3.container, otherStyles = _objectWithoutProperties(_this$$options$styles3, ["container"]);
                _context2.next = 10;
                return Promise.all([transition(this.$refs.container, {
                  from: {
                    height: "".concat(height, "px")
                  },
                  active: container.active,
                  to: {
                    height: 0
                  }
                }).then(function () {
                  // Add end styles only if the item has not been re-opened before the end
                  if (!_this3.isOpen) {
                    styles.add(_this3.$refs.container, {
                      height: 0,
                      visibility: 'invisible'
                    });

                    _this3.updateAttributes(_this3.isOpen);
                  }

                  return Promise.resolve();
                })].concat(_toConsumableArray(Object.entries(otherStyles).filter(function (_ref9) {
                  var _ref10 = _slicedToArray(_ref9, 1),
                      refName = _ref10[0];

                  return _this3.$refs[refName];
                }).map(function (_ref11) {
                  var _ref12 = _slicedToArray(_ref11, 2),
                      refName = _ref12[0],
                      _ref12$ = _ref12[1];

                  _ref12$ = _ref12$ === void 0 ? {} : _ref12$;
                  var open = _ref12$.open,
                      active = _ref12$.active,
                      closed = _ref12$.closed;
                  return transition(_this3.$refs[refName], {
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
  }, {
    key: "contentId",
    get: function get() {
      return "content-".concat(this.$id);
    }
  }]);

  return AccordionItem;
}(Base);

export { AccordionItem as default };
//# sourceMappingURL=AccordionItem.js.map