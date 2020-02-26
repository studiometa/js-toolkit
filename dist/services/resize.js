"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _Service2 = _interopRequireDefault(require("../abstracts/Service"));

var _debounce = _interopRequireDefault(require("../utils/debounce"));

/**
 * Resize service
 *
 * ```
 * import resize from '@studiometa/js/services/resize';
 * resize.add(id, handler);
 * resize.remove(id);
 * resize.props;
 * ```
 */
var Resize =
/*#__PURE__*/
function (_Service) {
  (0, _inherits2["default"])(Resize, _Service);

  function Resize() {
    (0, _classCallCheck2["default"])(this, Resize);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Resize).apply(this, arguments));
  }

  (0, _createClass2["default"])(Resize, [{
    key: "init",

    /**
     * Bind the handler to the resize event.
     *
     * @return {void}
     */
    value: function init() {
      var _this = this;

      this.handler = (0, _debounce["default"])(function () {
        _this.trigger(_this.props);
      }).bind(this);
      window.addEventListener('resize', this.handler);
    }
    /**
     * Unbind the handler from the resize event.
     *
     * @return {void}
     */

  }, {
    key: "kill",
    value: function kill() {
      window.removeEventListener('resize', this.handler);
    }
    /**
     * Get resize props.
     *
     * @type {Object}
     */

  }, {
    key: "props",
    get: function get() {
      var props = {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.innerWidth / window.innerHeight,
        orientation: 'square'
      };

      if (props.ratio > 1) {
        props.orientation = 'landscape';
      }

      if (props.ratio < 1) {
        props.orientation = 'portrait';
      }

      return props;
    }
  }]);
  return Resize;
}(_Service2["default"]);

var resize = new Resize();
var add = resize.add.bind(resize);
var remove = resize.remove.bind(resize);

var props = function props() {
  return resize.props;
};

var _default = function _default() {
  return {
    add: add,
    remove: remove,
    props: props
  };
};

exports["default"] = _default;
//# sourceMappingURL=resize.js.map