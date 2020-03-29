"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

/**
 * Event management class.
 *
 * @method $on    Bind a given function to the given event.
 * @method $off   Unbind the given function from the given event.
 * @method $once  Bind a given function to the given event once.
 * @method $emit  Emit an event with custom props.
 */
var EventManager = /*#__PURE__*/function () {
  function EventManager() {
    (0, _classCallCheck2["default"])(this, EventManager);
    (0, _defineProperty2["default"])(this, "events", {});
  }

  (0, _createClass2["default"])(EventManager, [{
    key: "$on",

    /**
     * Bind a listener function to an event.
     *
     * @param  {String}   event    Name of the event.
     * @param  {String}   listener Function to be called.
     * @return {Function}          A function to unbind the listener.
     */
    value: function $on(event, listener) {
      var _this = this;

      if (!Array.isArray(this.events[event])) {
        this.events[event] = [];
      }

      this.events[event].push(listener);
      return function () {
        _this.$off(event, listener);
      };
    }
    /**
     * Unbind a listener function from an event.
     *
     * @param  {String}       event    Name of the event.
     * @param  {String}       listener Function to be removed.
     * @return {EventManager}          The current instance.
     */

  }, {
    key: "$off",
    value: function $off(event, listener) {
      if (!Array.isArray(this.events[event])) {
        return this;
      } // If no event specified, we remove them all.


      if (!event) {
        this.events = {};
        return this;
      } // If no listener have been specified, we remove all
      // the listeners for the given event.


      if (!listener) {
        this.events[event] = [];
        return this;
      }

      var index = this.events[event].indexOf(listener);

      if (index > -1) {
        this.events[event].splice(index, 1);
      }

      return this;
    }
    /**
     * Emits an event.
     *
     * @param  {String}       event Name of the event.
     * @param  {Array}        args  The arguments to apply to the functions bound to this event.
     * @return {EventManager}       The current instance.
     */

  }, {
    key: "$emit",
    value: function $emit(event) {
      var _this2 = this;

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (!Array.isArray(this.events[event])) {
        return this;
      }

      this.events[event].forEach(function (listener) {
        listener.apply(_this2, args);
      });
      return this;
    }
    /**
     * Bind a listener function to an event for one execution only.
     *
     * @param  {String}       event    Name of the event.
     * @param  {String}       listener Function to be called.
     * @return {EventManager}          The current instance.
     */

  }, {
    key: "$once",
    value: function $once(event, listener) {
      var instance = this;
      this.$on(event, function handler() {
        instance.$off(event, handler);

        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        listener.apply(instance, args);
      });
      return this;
    }
  }]);
  return EventManager;
}();

exports["default"] = EventManager;
//# sourceMappingURL=EventManager.js.map