"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

/** @type {Object} A schema used to validate objects' keys */
var schema = {
  init: {
    test: function test(descriptor) {
      return typeof descriptor.value === 'function';
    },
    error: 'The `init` method must be implemented.'
  },
  kill: {
    test: function test(descriptor) {
      return typeof descriptor.value === 'function';
    },
    error: 'The `kill` method must be implemented.'
  },

  /**
   * The `props` property must be a getter
   * @type {Object}
   */
  props: {
    test: function test(descriptor) {
      return typeof descriptor.get === 'function';
    },
    error: 'Foo'
  },
  key: {
    test: function test(descriptor) {
      return typeof descriptor.value === 'string';
    },
    error: 'The `key` parameter must be a string.'
  },
  callback: {
    test: function test(descriptor) {
      return typeof descriptor.value === 'function';
    },
    error: 'The `callback` parameter must be a function.'
  }
};
/**
 * List of methods or properties that MUST be implemented by child classes.
 * @type {Object}
 */

var implementations = {
  init: 'The `init` method must be implemented.',
  kill: 'The `kill` method must be implemented.',
  props: 'The `props` getter must be implemented.'
};
/**
 * Test if the children classes implements this class correctly
 *
 * @return {Service} The current instance
 */

function testImplementation(obj) {
  var descriptors = Object.getOwnPropertyDescriptors(obj);
  var methods = Object.keys(descriptors);
  Object.entries(implementations).forEach(function (_ref) {
    var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
        key = _ref2[0],
        error = _ref2[1];

    if (!methods.includes(key)) {
      throw new Error(error);
    }
  });
  return this;
}
/**
 * Test the given object against the schema.
 *
 * @param  {Object}  object The object to test
 * @return {Service}        The current instance
 */


function testSchema(object) {
  Object.entries(Object.getOwnPropertyDescriptors(object)).forEach(function (_ref3) {
    var _ref4 = (0, _slicedToArray2["default"])(_ref3, 2),
        key = _ref4[0],
        value = _ref4[1];

    if ({}.hasOwnProperty.call(schema, key) && !schema[key].test(value)) {
      throw new Error(schema[key].error);
    }
  });
}
/**
 * Service abstract class
 */


var Service =
/*#__PURE__*/
function () {
  /**
   * Class constructor, used to test the abstract class implementation.
   *
   * @return {Service} The current instance
   */
  function Service() {
    (0, _classCallCheck2["default"])(this, Service);
    this.callbacks = new Map();
    this.isInit = false;
    testImplementation(Object.getPrototypeOf(this));
    testSchema(Object.getPrototypeOf(this));
  }
  /**
   * Method to initialize the service behaviors.
   * This method MUST be implemented by the service implementing this class.
   *
   * @return {Service} The current instance
   */


  (0, _createClass2["default"])(Service, [{
    key: "init",
    value: function init() {
      return this;
    }
    /**
     * Method to kill the service behaviors.
     * This method MUST be implemented by the service implementing this class.
     *
     * @return {Service} The current instance
     */

  }, {
    key: "kill",
    value: function kill() {
      return this;
    }
    /**
     * Add a callback.
     *
     * @param  {String}   key      The callback's identifier
     * @param  {Function} callback The callback function
     * @return {Service}           The current instance
     */

  }, {
    key: "add",
    value: function add(key, callback) {
      testSchema({
        key: key,
        callback: callback
      });

      if (this.has(key)) {
        throw new Error("A callback with the key `".concat(key, "` has already been registered."));
      } // Initialize the service when we add the first callback


      if (this.callbacks.size === 0 && !this.isInit) {
        this.init();
        this.isInit = true;
      }

      this.callbacks.set(key, callback);
      return this;
    }
    /**
     * Test if a callback with the given key has already been added.
     *
     * @param  {String}  key The identifier to test
     * @return {Boolean}     Whether or not the identifier already exists
     */

  }, {
    key: "has",
    value: function has(key) {
      testSchema({
        key: key
      });
      return this.callbacks.has(key);
    }
    /**
     * Get the callback tied to the given key.
     *
     * @param  {String}   key The identifier to get
     * @return {Function}     The callback function
     */

  }, {
    key: "get",
    value: function get(key) {
      testSchema({
        key: key
      });
      return this.callbacks.get(key);
    }
    /**
     * Remove the callback tied to the given key.
     *
     * @param  {String} key The identifier to remove
     * @return {Service}    The current instance
     */

  }, {
    key: "remove",
    value: function remove(key) {
      testSchema({
        key: key
      });
      this.callbacks["delete"](key); // Kill the service when we add the first callback

      if (this.callbacks.size === 0 && this.isInit) {
        this.kill();
        this.isInit = false;
      }

      return this;
    }
    /**
     * Trigger each added callback with the given arguments.
     *
     * @param  {Array}   args All the arguments to apply to the callback
     * @return {Service}      The current instance
     */

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
  }]);
  return Service;
}();

exports["default"] = Service;
//# sourceMappingURL=Service.js.map