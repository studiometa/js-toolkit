/**
 * @typedef {import('../index.js').BaseComponent} BaseComponent
 * @typedef {import('../index.js').default} Base
 */

/**
 * Manager to bind and unbind event listeners from a list of child components.
 */
export default class EventsChildrenManager {
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
   * The children components to bind the handlers to.
   * @type {(Base | Promise<Base>)[]}
   */
  children = [];

  /**
   * @param {(Base | Promise<Base>)[]} children
   * @param {string} event
   * @param {Function} method
   */
  constructor(children, event, method) {
    this.children = children;
    this.event = event;
    this.method = method;
  }

  /**
   * Bind method to each child for the given event.
   */
  bindAll() {
    this.children.forEach(async (child) => {
      if (child instanceof Promise) {
        child.then((instance) => {
          instance.$on(this.event, this.method);
        });
      } else {
        child.$on(this.event, this.method);
      }
    });
  }

  /**
   * Unbind method to each child for the given event.
   */
  unbindAll() {
    this.children.forEach((child) => {
      if (child instanceof Promise) {
        child.then((instance) => {
          instance.$off(this.event, this.method);
        });
      } else {
        child.$off(this.event, this.method);
      }
    });
  }
}
