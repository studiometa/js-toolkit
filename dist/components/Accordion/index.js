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

var _Base2 = _interopRequireDefault(require("../../abstracts/Base"));

var _AccordionItem = _interopRequireDefault(require("./AccordionItem"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * Accordion class.
 */
var Accordion = /*#__PURE__*/function (_Base) {
  (0, _inherits2.default)(Accordion, _Base);

  var _super = _createSuper(Accordion);

  function Accordion() {
    (0, _classCallCheck2.default)(this, Accordion);
    return _super.apply(this, arguments);
  }

  (0, _createClass2.default)(Accordion, [{
    key: "mounted",

    /**
     * Init autoclose behavior on mounted.
     * @return {void}
     */
    value: function mounted() {
      var _this = this;

      this.unbindOpen = this.$children.AccordionItem.map(function (item, index) {
        return item.$on('open', function () {
          if (_this.$options.autoclose) {
            _this.$children.AccordionItem.filter(function (el, i) {
              return index !== i;
            }).forEach(function (it) {
              return it.close();
            });
          }
        });
      });
    }
    /**
     * Destroy autoclose behavior on destroyed.
     * @return {void}
     */

  }, {
    key: "destroyed",
    value: function destroyed() {
      this.unbindOpen.forEach(function (unbind) {
        return unbind();
      });
    }
  }, {
    key: "config",

    /**
     * Accordion config.
     * @return {Object}
     */
    get: function get() {
      return {
        name: 'Accordion',
        autoclose: true,
        components: {
          AccordionItem: _AccordionItem.default
        }
      };
    }
  }]);
  return Accordion;
}(_Base2.default);

exports.default = Accordion;
//# sourceMappingURL=index.js.map