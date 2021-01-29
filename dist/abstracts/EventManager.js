import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

var EventManager = function () {
  function EventManager() {
    _classCallCheck(this, EventManager);

    _defineProperty(this, "_events", {});
  }

  _createClass(EventManager, [{
    key: "$on",
    value: function $on(event, listener) {
      var _this = this;

      if (!Array.isArray(this._events[event])) {
        this._events[event] = [];
      }

      this._events[event].push(listener);

      return function () {
        _this.$off(event, listener);
      };
    }
  }, {
    key: "$off",
    value: function $off(event, listener) {
      if (!event) {
        this._events = {};
        return this;
      }

      if (!listener) {
        this._events[event] = [];
        return this;
      }

      var index = this._events[event].indexOf(listener);

      if (index > -1) {
        this._events[event].splice(index, 1);
      }

      return this;
    }
  }, {
    key: "$emit",
    value: function $emit(event) {
      var _this2 = this;

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (!Array.isArray(this._events[event])) {
        return this;
      }

      this._events[event].forEach(function (listener) {
        listener.apply(_this2, args);
      });

      return this;
    }
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

export { EventManager as default };
//# sourceMappingURL=EventManager.js.map