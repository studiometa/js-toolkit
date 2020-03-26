/**
 * Event management class.
 *
 * @method $on    Bind a given function to the given event.
 * @method $off   Unbind the given function from the given event.
 * @method $once  Bind a given function to the given event once.
 * @method $emit  Emit an event with custom props.
 */
export default class EventManager {
  /** @type {Object} An object to store the events */
  events = {};

  /**
   * Bind a listener function to an event.
   *
   * @param  {String}   event    Name of the event.
   * @param  {String}   listener Function to be called.
   * @return {Function}          A function to unbind the listener.
   */
  $on(event, listener) {
    if (!Array.isArray(this.events[event])) {
      this.events[event] = [];
    }
    this.events[event].push(listener);

    return () => {
      this.$off(event, listener);
    };
  }

  /**
   * Unbind a listener function from an event.
   *
   * @param  {String}       event    Name of the event.
   * @param  {String}       listener Function to be removed.
   * @return {EventManager}          The current instance.
   */
  $off(event, listener) {
    if (!Array.isArray(this.events[event])) {
      return this;
    }
    // If no event specified, we remove them all.
    if (!event) {
      this.events = {};
      return this;
    }

    // If no listener have been specified, we remove all
    // the listeners for the given event.
    if (!listener) {
      this.events[event] = [];
      return this;
    }

    const index = this.events[event].indexOf(listener);

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
  $emit(event, ...args) {
    if (!Array.isArray(this.events[event])) {
      return this;
    }

    this.events[event].forEach(listener => {
      listener.apply(this, args);
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
  $once(event, listener) {
    const instance = this;
    this.$on(event, function handler(...args) {
      instance.$off(event, handler);
      listener.apply(instance, args);
    });
    return this;
  }
}
