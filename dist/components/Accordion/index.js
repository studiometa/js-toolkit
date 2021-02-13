import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import Base from "../../abstracts/Base/index.js";
import AccordionItem from "./AccordionItem.js";

var Accordion = function (_Base) {
  _inherits(Accordion, _Base);

  var _super = _createSuper(Accordion);

  function Accordion() {
    var _this;

    _classCallCheck(this, Accordion);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "unbindMethods", []);

    return _this;
  }

  _createClass(Accordion, [{
    key: "mounted",
    value: function () {
      var _mounted = _asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
        var _this2 = this;

        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.unbindMethods = this.$children.AccordionItem.map(function (item, index) {
                  var unbindOpen = item.$on('open', function () {
                    _this2.$emit('open', item, index);

                    if (_this2.$options.autoclose) {
                      _this2.$children.AccordionItem.filter(function (el, i) {
                        return index !== i;
                      }).forEach(function (it) {
                        return it.close();
                      });
                    }
                  });
                  var unbindClose = item.$on('close', function () {
                    _this2.$emit('close', item, index);
                  });
                  return function () {
                    unbindOpen();
                    unbindClose();
                  };
                });

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function mounted() {
        return _mounted.apply(this, arguments);
      }

      return mounted;
    }()
  }, {
    key: "destroyed",
    value: function destroyed() {
      this.unbindMethods.forEach(function (unbind) {
        return unbind();
      });
    }
  }]);

  return Accordion;
}(Base);

_defineProperty(Accordion, "config", {
  name: 'Accordion',
  options: {
    autoclose: Boolean,
    item: Object
  },
  components: {
    AccordionItem: AccordionItem
  }
});

export { Accordion as default };
//# sourceMappingURL=index.js.map