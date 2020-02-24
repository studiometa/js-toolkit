/**
 * Event management class.
 *
 * @method $on    Bind a given function to the given event.
 * @method $off   Unbind the given function from the given event.
 * @method $once  Bind a given function to the given event once.
 * @method $emit  Emit an event with custom props.
 */
export default abstract class EventManager {
  /** @type {Object} A private object to store the events */
  #events: { [key: string]: any } = {};

  /**
   * Adds the event and the listener to the events list.
   *
   * @param  {String}       event    Name of the event.
   * @param  {String}       listener Function to be called.
   * @return {EventManager}          The current instance.
   */
  $on(event: string, listener: (...args: any) => void) {
    if (typeof this.#events[event] !== 'object') {
      this.#events[event] = [];
    }

    this.#events[event].push(listener);

    return this;
  }

  /**
   * Removes the event and the listener from the events list.
   *
   * @param  {String}       event    Name of the event.
   * @param  {String}       listener Function to be removed.
   * @return {EventManager}          The current instance.
   */
  $off(event: string, listener: (...args: any) => void) {
    if (!Array.isArray(this.#events[event])) {
      return this;
    }

    // If no event specified, we remove them all.
    if (!event) {
      this.#events = {};
      return this;
    }

    // If no listener have been specified, we remove all the listeners for
    // the given event.
    if (!listener) {
      this.#events[event] = [];
      return this;
    }

    const index = this.#events[event].indexOf(listener);
    if (index > -1) {
      this.#events[event].splice(index, 1);
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
  $emit(event: string, ...args: any) {
    if (!Array.isArray(this.#events[event])) {
      return this;
    }

    this.#events[event].forEach((listener) => {
      listener.apply(this, args);
    });

    return this;
  }

  /**
   * Emits an event once and then removes it.
   *
   * @param  {String}       event    Name of the event.
   * @param  {String}       listener Function to be called.
   * @return {EventManager}          The current instance.
   */
  $once(event: string, listener: (...args: any) => void) {
    const instance = this;
    this.$on(event, function handler(...args) {
      instance.$off(event, handler);
      listener.apply(instance, args);
    });

    return this;
  }

  /**
   * Get the all the events attached to the current instance.
   *
   * @return {Object}
   */
  get events() {
    return this.#events;
  }
}
