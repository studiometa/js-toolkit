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
  }

  /**
   * Getter to get the services properties.
   * This getter MUST be implementer by the service extending this class.
   * @return {Object}
   */
  get props() {
    throw new Error('The `props` getter must be implemented.');
  }

  /**
   * Method to initialize the service behaviors.
   * This method MUST be implemented by the service extending this class.
   *
   * @return {Service} The current instance
   */
  init() {
    throw new Error('The `init` method must be implemented.');
  }

  /**
   * Method to kill the service behaviors.
   * This method MUST be implemented by the service extending this class.
   *
   * @return {Service} The current instance
   */
  kill() {
    throw new Error('The `kill` method must be implemented.');
  }

  /**
   * Add a callback.
   *
   * @param  {String}   key      The callback's identifier
   * @param  {Function} callback The callback function
   * @return {Service}           The current instance
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
    return this;
  }

  /**
   * Test if a callback with the given key has already been added.
   *
   * @param  {String}  key The identifier to test
   * @return {Boolean}     Whether or not the identifier already exists
   */
  has(key) {
    return this.callbacks.has(key);
  }

  /**
   * Get the callback tied to the given key.
   *
   * @param  {String}   key The identifier to get
   * @return {Function}     The callback function
   */
  get(key) {
    return this.callbacks.get(key);
  }

  /**
   * Remove the callback tied to the given key.
   *
   * @param  {String} key The identifier to remove
   * @return {Service}    The current instance
   */
  remove(key) {
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
