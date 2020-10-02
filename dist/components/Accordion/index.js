import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import Base from '../../abstracts/Base';
import AccordionItem from './AccordionItem';
/**
 * Accordion class.
 */

var Accordion = /*#__PURE__*/function (_Base) {
  _inherits(Accordion, _Base);

  var _super = _createSuper(Accordion);

  function Accordion() {
    _classCallCheck(this, Accordion);

    return _super.apply(this, arguments);
  }

  _createClass(Accordion, [{
    key: "mounted",

    /**
     * Init autoclose behavior on mounted.
     * @return {void}
     */
    value: function mounted() {
      var _this = this;

      this.unbindMethods = this.$children.AccordionItem.map(function (item, index) {
        var unbindOpen = item.$on('open', function () {
          _this.$emit('open', item, index);

          if (_this.$options.autoclose) {
            _this.$children.AccordionItem.filter(function (el, i) {
              return index !== i;
            }).forEach(function (it) {
              return it.close();
            });
          }
        });
        var unbindClose = item.$on('close', function () {
          _this.$emit('close', item, index);
        });
        return function () {
          unbindOpen();
          unbindClose();
        };
      });
    }
    /**
     * Destroy autoclose behavior on destroyed.
     * @return {void}
     */

  }, {
    key: "destroyed",
    value: function destroyed() {
      this.unbindMethods.forEach(function (unbind) {
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
        item: null,
        components: {
          AccordionItem: AccordionItem
        }
      };
    }
  }]);

  return Accordion;
}(Base);

export { Accordion as default };
//# sourceMappingURL=index.js.map