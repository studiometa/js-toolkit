/**
 * Manager to bind and unbind event listeners from a list of elements.
 */
export default class EventsRefsManager {
  /**
   * The event name.
   * @type {string}
   */
  event;

  /**
   * The event handler.
   * @type {Function}
   */
  method;

  /**
   * The refs to bind the handler to.
   * @type {HTMLElement[]}
   */
  refs = [];

  /**
   * @param {HTMLElement[]} refs
   * @param {string} event
   * @param {Function} method
   */
  constructor(refs, event, method) {
    this.refs = refs;
    this.event = event;
    this.method = method;
  }

  /**
   * Bind the method to each ref for the given event.
   */
  bindAll() {
    this.refs.forEach((ref) => {
      ref.addEventListener(this.event, this.method);
    });
  }

  /**
   * Unbind the method from each ref for the given event.
   */
  unbindAll() {
    this.refs.forEach((ref) => {
      ref.removeEventListener(this.event, this.method);
    });
  }
}
