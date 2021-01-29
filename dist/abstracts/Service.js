import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";

var Service = function () {
  function Service() {
    _classCallCheck(this, Service);

    this.callbacks = new Map();
    this.isInit = false;
  }

  _createClass(Service, [{
    key: "init",
    value: function init() {
      throw new Error('The `init` method must be implemented.');
    }
  }, {
    key: "kill",
    value: function kill() {
      throw new Error('The `kill` method must be implemented.');
    }
  }, {
    key: "add",
    value: function add(key, callback) {
      if (this.has(key)) {
        throw new Error("A callback with the key `".concat(key, "` has already been registered."));
      }

      if (this.callbacks.size === 0 && !this.isInit) {
        this.init();
        this.isInit = true;
      }

      this.callbacks.set(key, callback);
      return this;
    }
  }, {
    key: "has",
    value: function has(key) {
      return this.callbacks.has(key);
    }
  }, {
    key: "get",
    value: function get(key) {
      return this.callbacks.get(key);
    }
  }, {
    key: "remove",
    value: function remove(key) {
      this.callbacks.delete(key);

      if (this.callbacks.size === 0 && this.isInit) {
        this.kill();
        this.isInit = false;
      }

      return this;
    }
  }, {
    key: "trigger",
    value: function trigger() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this.callbacks.forEach(function (callback) {
        callback.apply(void 0, args);
      });
      return this;
    }
  }, {
    key: "props",
    get: function get() {
      throw new Error('The `props` getter must be implemented.');
    }
  }]);

  return Service;
}();

export { Service as default };
//# sourceMappingURL=Service.js.map