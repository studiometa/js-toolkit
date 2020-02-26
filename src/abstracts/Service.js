/** @type {Object} A schema used to validate objects' keys */
const schema = {
  init: {
    test: descriptor => typeof descriptor.value === 'function',
    error: 'The `init` method must be implemented.',
  },
  kill: {
    test: descriptor => typeof descriptor.value === 'function',
    error: 'The `kill` method must be implemented.',
  },
  /**
   * The `props` property must be a getter
   * @type {Object}
   */
  props: {
    test: descriptor => typeof descriptor.get === 'function',
    error: 'Foo',
  },
  key: {
    test: descriptor => typeof descriptor.value === 'string',
    error: 'The `key` parameter must be a string.',
  },
  callback: {
    test: descriptor => typeof descriptor.value === 'function',
    error: 'The `callback` parameter must be a function.',
  },
};

/**
 * List of methods or properties that MUST be implemented by child classes.
 * @type {Object}
 */
const implementations = {
  init: 'The `init` method must be implemented.',
  kill: 'The `kill` method must be implemented.',
  props: 'The `props` getter must be implemented.',
};

/**
 * Test if the children classes implements this class correctly
 *
 * @return {Service} The current instance
 */
function testImplementation(obj) {
  const descriptors = Object.getOwnPropertyDescriptors(obj);
  const methods = Object.keys(descriptors);

  Object.entries(implementations).forEach(([key, error]) => {
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
  Object.entries(Object.getOwnPropertyDescriptors(object)).forEach(([key, value]) => {
    if ({}.hasOwnProperty.call(schema, key) && !schema[key].test(value)) {
      throw new Error(schema[key].error);
    }
  });
}

/**
 * Service abstract class
 */
export default class Service {
  /**
   * Class constructor, used to test the abstract class implementation.
   *
   * @return {Service} The current instance
   */
  constructor() {
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
  init() {
    return this;
  }

  /**
   * Method to kill the service behaviors.
   * This method MUST be implemented by the service implementing this class.
   *
   * @return {Service} The current instance
   */
  kill() {
    return this;
  }

  /**
   * Add a callback.
   *
   * @param  {String}   key      The callback's identifier
   * @param  {Function} callback The callback function
   * @return {Service}           The current instance
   */
  add(key, callback) {
    testSchema({ key, callback });

    if (this.has(key)) {
      throw new Error(`A callback with the key \`${key}\` has already been registered.`);
    }

    // Initialize the service when we add the first callback
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
  has(key) {
    testSchema({ key });
    return this.callbacks.has(key);
  }

  /**
   * Get the callback tied to the given key.
   *
   * @param  {String}   key The identifier to get
   * @return {Function}     The callback function
   */
  get(key) {
    testSchema({ key });
    return this.callbacks.get(key);
  }

  /**
   * Remove the callback tied to the given key.
   *
   * @param  {String} key The identifier to remove
   * @return {Service}    The current instance
   */
  remove(key) {
    testSchema({ key });
    this.callbacks.delete(key);

    // Kill the service when we add the first callback
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
  trigger(...args) {
    this.callbacks.forEach(callback => {
      callback(...args);
    });

    return this;
  }
}
