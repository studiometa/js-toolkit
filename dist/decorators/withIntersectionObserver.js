import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _createClass from "@babel/runtime/helpers/createClass";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _get from "@babel/runtime/helpers/get";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import { debug } from "../abstracts/Base/utils.js";

function createArrayOfNumber(length) {
  return _toConsumableArray(new Array(length + 1)).map(function (val, index) {
    return index / length;
  });
}

export default (function (BaseClass) {
  var _class, _temp, _BaseClass$config$nam, _BaseClass$config, _BaseClass$config2;

  var defaultOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    threshold: createArrayOfNumber(100)
  };
  return _temp = _class = function (_BaseClass) {
    _inherits(_class, _BaseClass);

    var _super = _createSuper(_class);

    _createClass(_class, [{
      key: "_excludeFromAutoBind",
      get: function get() {
        return [].concat(_toConsumableArray(_get(_getPrototypeOf(_class.prototype), "_excludeFromAutoBind", this) || []), ['intersected']);
      }
    }]);

    function _class(element) {
      var _this;

      _classCallCheck(this, _class);

      _this = _super.call(this, element);

      if (!_this.intersected || typeof _this.intersected !== 'function') {
        throw new Error('[withIntersectionObserver] The `intersected` method must be defined.');
      }

      _this.$observer = new IntersectionObserver(function (entries) {
        debug(_assertThisInitialized(_this), 'intersected', entries);

        _this.$emit('intersected', entries);

        _this.intersected(entries);
      }, _objectSpread(_objectSpread({}, defaultOptions), _this.$options.intersectionObserver || {}));

      if (_this.$isMounted) {
        _this.$observer.observe(_this.$el);
      }

      _this.$on('mounted', function () {
        _this.$observer.observe(_this.$el);
      });

      _this.$on('destroyed', function () {
        _this.$observer.unobserve(_this.$el);
      });

      return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
    }

    return _class;
  }(BaseClass), _defineProperty(_class, "config", _objectSpread(_objectSpread({}, BaseClass.config || {}), {}, {
    name: "".concat((_BaseClass$config$nam = BaseClass === null || BaseClass === void 0 ? void 0 : (_BaseClass$config = BaseClass.config) === null || _BaseClass$config === void 0 ? void 0 : _BaseClass$config.name) !== null && _BaseClass$config$nam !== void 0 ? _BaseClass$config$nam : '', "WithIntersectionObserver"),
    options: _objectSpread(_objectSpread({}, (BaseClass === null || BaseClass === void 0 ? void 0 : (_BaseClass$config2 = BaseClass.config) === null || _BaseClass$config2 === void 0 ? void 0 : _BaseClass$config2.options) || {}), {}, {
      intersectionObserver: Object
    })
  })), _temp;
});
//# sourceMappingURL=withIntersectionObserver.js.map