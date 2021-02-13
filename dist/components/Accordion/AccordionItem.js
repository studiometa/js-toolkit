import _regeneratorRuntime from "@babel/runtime/regenerator";
import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _objectWithoutProperties from "@babel/runtime/helpers/objectWithoutProperties";
import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import deepmerge from 'deepmerge';
import Base from "../../abstracts/Base/index.js";
import Accordion from "./index.js";
import * as styles from "../../utils/css/styles.js";
import transition from "../../utils/css/transition.js";

var AccordionItem = function (_Base) {
  _inherits(AccordionItem, _Base);

  var _super = _createSuper(AccordionItem);

  function AccordionItem() {
    _classCallCheck(this, AccordionItem);

    return _super.apply(this, arguments);
  }

  _createClass(AccordionItem, [{
    key: "mounted",
    value: function mounted() {
      var _this = this;

      if (this.$parent && this.$parent instanceof Accordion && this.$parent.$options.item) {
        Object.entries(this.$parent.$options.item).forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              key = _ref2[0],
              value = _ref2[1];

          if (key in _this.$options) {
            var type = AccordionItem.config.options[key].type || AccordionItem.config.options[key];

            if (type === Array || type === Object) {
              _this.$options[key] = deepmerge(_this.$options[key], value);
            } else {
              _this.$options[key] = value;
            }
          }
        });
      }

      this.$refs.btn.setAttribute('id', this.$id);
      this.$refs.btn.setAttribute('aria-controls', this.contentId);
      this.$refs.content.setAttribute('aria-labelledby', this.$id);
      this.$refs.content.setAttribute('id', this.contentId);
      var isOpen = this.$options.isOpen;
      this.updateAttributes(isOpen);

      if (!isOpen) {
        styles.add(this.$refs.container, {
          visibility: 'invisible',
          height: '0'
        });
      }

      var _this$$options$styles = this.$options.styles,
          container = _this$$options$styles.container,
          otherStyles = _objectWithoutProperties(_this$$options$styles, ["container"]);

      var refs = this.$refs;
      Object.entries(otherStyles).filter(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 1),
            refName = _ref4[0];

        return refs[refName];
      }).forEach(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            refName = _ref6[0],
            _ref6$ = _ref6[1];

        _ref6$ = _ref6$ === void 0 ? {
          open: '',
          closed: ''
        } : _ref6$;
        var open = _ref6$.open,
            closed = _ref6$.closed;
        transition(refs[refName], {
          to: isOpen ? open : closed
        }, 'keep');
      });
    }
  }, {
    key: "onBtnClick",
    value: function onBtnClick() {
      if (this.$options.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
  }, {
    key: "updateAttributes",
    value: function updateAttributes(isOpen) {
      this.$refs.content.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      this.$refs.btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
  }, {
    key: "open",
    value: function () {
      var _open = _asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
        var _this2 = this;

        var _this$$options$styles2, container, otherStyles, refs;

        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.$options.isOpen) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return");

              case 2:
                this.$log('open');
                this.$emit('open');
                this.$options.isOpen = true;
                this.updateAttributes(this.$options.isOpen);
                styles.remove(this.$refs.container, {
                  visibility: 'invisible'
                });
                _this$$options$styles2 = this.$options.styles, container = _this$$options$styles2.container, otherStyles = _objectWithoutProperties(_this$$options$styles2, ["container"]);
                refs = this.$refs;
                _context.next = 11;
                return Promise.all([transition(refs.container, {
                  from: {
                    height: 0
                  },
                  active: container.active,
                  to: {
                    height: "".concat(refs.content.offsetHeight, "px")
                  }
                }).then(function () {
                  if (_this2.$options.isOpen) {
                    styles.remove(refs.content, {
                      position: 'absolute'
                    });
                  }

                  return Promise.resolve();
                })].concat(_toConsumableArray(Object.entries(otherStyles).filter(function (_ref7) {
                  var _ref8 = _slicedToArray(_ref7, 1),
                      refName = _ref8[0];

                  return refs[refName];
                }).map(function (_ref9) {
                  var _ref10 = _slicedToArray(_ref9, 2),
                      refName = _ref10[0],
                      _ref10$ = _ref10[1];

                  _ref10$ = _ref10$ === void 0 ? {
                    open: '',
                    active: '',
                    closed: ''
                  } : _ref10$;
                  var open = _ref10$.open,
                      active = _ref10$.active,
                      closed = _ref10$.closed;
                  return transition(refs[refName], {
                    from: closed,
                    active: active,
                    to: open
                  }, 'keep');
                }))));

              case 11:
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
  }, {
    key: "close",
    value: function () {
      var _close = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2() {
        var _this3 = this;

        var height, _this$$options$styles3, container, otherStyles, refs;

        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this.$options.isOpen) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt("return");

              case 2:
                this.$log('close');
                this.$emit('close');
                this.$options.isOpen = false;
                height = this.$refs.container.offsetHeight;
                styles.add(this.$refs.content, {
                  position: 'absolute'
                });
                _this$$options$styles3 = this.$options.styles, container = _this$$options$styles3.container, otherStyles = _objectWithoutProperties(_this$$options$styles3, ["container"]);
                refs = this.$refs;
                _context2.next = 11;
                return Promise.all([transition(refs.container, {
                  from: {
                    height: "".concat(height, "px")
                  },
                  active: container.active,
                  to: {
                    height: '0'
                  }
                }).then(function () {
                  if (!_this3.$options.isOpen) {
                    styles.add(refs.container, {
                      height: '0',
                      visibility: 'invisible'
                    });

                    _this3.updateAttributes(_this3.$options.isOpen);
                  }

                  return Promise.resolve();
                })].concat(_toConsumableArray(Object.entries(otherStyles).filter(function (_ref11) {
                  var _ref12 = _slicedToArray(_ref11, 1),
                      refName = _ref12[0];

                  return refs[refName];
                }).map(function (_ref13) {
                  var _ref14 = _slicedToArray(_ref13, 2),
                      refName = _ref14[0],
                      _ref14$ = _ref14[1];

                  _ref14$ = _ref14$ === void 0 ? {
                    open: '',
                    active: '',
                    closed: ''
                  } : _ref14$;
                  var open = _ref14$.open,
                      active = _ref14$.active,
                      closed = _ref14$.closed;
                  return transition(refs[refName], {
                    from: open,
                    active: active,
                    to: closed
                  }, 'keep');
                }))));

              case 11:
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
    key: "contentId",
    get: function get() {
      return "content-".concat(this.$id);
    }
  }]);

  return AccordionItem;
}(Base);

_defineProperty(AccordionItem, "config", {
  name: 'AccordionItem',
  refs: ['btn', 'content', 'container'],
  options: {
    isOpen: Boolean,
    styles: {
      type: Object,
      default: function _default() {
        return {
          container: {
            open: '',
            active: '',
            closed: ''
          }
        };
      }
    }
  }
});

export { AccordionItem as default };
//# sourceMappingURL=AccordionItem.js.map