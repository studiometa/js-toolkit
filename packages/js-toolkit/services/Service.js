/**
 * Service abstract class
 */
export default class Service {
  /**
   * Class constructor, used to test the abstract class implementation.
   */
  constructor() {
    this.callbacks = new Map();
    this.isInit = false;
  }

  /**
   * @type {unknown}
   */
  props;

  // eslint-disable-next-line jsdoc/require-returns-check
  /**
   * Method to update the services properties.
   * This method MUST be implemented by the service extending this class.
   *
   * @param {...any} args
   * @returns {this['props']}
   */
  updateProps(...args) {
    this.props = args;
    throw new Error('The `updateProps` method must be implemented.');
  }

  /**
   * Method to initialize the service behaviors.
   * This method MUST be implemented by the service extending this class.
   *
   * @returns {void}
   */
  init() {
    throw new Error('The `init` method must be implemented.');
  }

  /**
   * Method to kill the service behaviors.
   * This method MUST be implemented by the service extending this class.
   *
   * @returns {void}
   */
  kill() {
    throw new Error('The `kill` method must be implemented.');
  }

  /**
   * Add a callback.
   *
   * @param  {string}   key      The callback's identifier
   * @param  {Function} callback The callback function
   * @returns {void}
   */
  add(key, callback) {
    if (this.has(key)) {
      throw new Error(`A callback with the key \`${key}\` has already been registered.`);
    }

    // Initialize the service when we add the first callback
    if (this.callbacks.size === 0 && !this.isInit) {
      this.init();
      this.isInit = true;
    }

    this.callbacks.set(key, callback);
  }

  /**
   * Test if a callback with the given key has already been added.
   *
   * @param  {string}  key The identifier to test
   * @returns {boolean}     Whether or not the identifier already exists
   */
  has(key) {
    return this.callbacks.has(key);
  }

  /**
   * Get the callback tied to the given key.
   *
   * @param  {string}   key The identifier to get
   * @returns {Function}     The callback function
   */
  get(key) {
    return this.callbacks.get(key);
  }

  /**
   * Remove the callback tied to the given key.
   *
   * @param {string} key The identifier to remove
   */
  remove(key) {
    this.callbacks.delete(key);

    // Kill the service when we remove the last callback
    if (this.callbacks.size === 0 && this.isInit) {
      this.kill();
      this.isInit = false;
    }
  }

  /**
   * Trigger each added callback with the given arguments.
   *
   * @param  {...any}   args All the arguments to apply to the callback
   * @returns {this}      The current instance
   */
  trigger(...args) {
    this.callbacks.forEach(function forEachCallback(callback) {
      callback(...args);
    });

    return this;
  }
}
