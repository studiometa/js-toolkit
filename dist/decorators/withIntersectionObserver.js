"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _utils = require("../abstracts/Base/utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * Create an array of number between 0 and 1 from the given length.
 * @param  {Number} length The length of the array.
 * @return {Array}        An array of number.
 */
function createArrayOfNumber(length) {
  return (0, _toConsumableArray2.default)(new Array(length + 1)).map(function (val, index) {
    return index / length;
  });
}
/**
 * IntersectionObserver decoration.
 */


var _default = function _default(BaseClass) {
  var defaultOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    threshold: createArrayOfNumber(100)
  };
  return /*#__PURE__*/function (_BaseClass) {
    (0, _inherits2.default)(_class, _BaseClass);

    var _super = _createSuper(_class);

    (0, _createClass2.default)(_class, [{
      key: "_excludeFromAutoBind",

      /**
       * Add the `intersected` method to the list of method to exclude from the `autoBind` call.
       */
      get: function get() {
        return [].concat((0, _toConsumableArray2.default)((0, _get2.default)((0, _getPrototypeOf2.default)(_class.prototype), "_excludeFromAutoBind", this) || []), ['intersected']);
      }
      /**
       * Create an observer when the class in instantiated.
       *
       * @param  {HTMLElement} element The component's root element.
       * @return {Base}                The class instace.
       */

    }]);

    function _class(element) {
      var _this;

      (0, _classCallCheck2.default)(this, _class);
      _this = _super.call(this, element);

      if (!_this.intersected || typeof _this.intersected !== 'function') {
        throw new Error('[withIntersectionObserver] The `intersected` method must be defined.');
      }

      _this.$observer = new IntersectionObserver(function (entries) {
        (0, _utils.debug)((0, _assertThisInitialized2.default)(_this), 'intersected', entries);

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

      return (0, _possibleConstructorReturn2.default)(_this, (0, _assertThisInitialized2.default)(_this));
    }

    return _class;
  }(BaseClass);
};

exports.default = _default;
//# sourceMappingURL=withIntersectionObserver.js.map