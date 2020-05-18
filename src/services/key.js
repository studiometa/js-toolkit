import Service from '../abstracts/Service';
import { keyCodes } from '../utils';

/**
 * Scroll service
 *
 * ```
 * import { useScroll } from '@studiometa/js-toolkit/services';
 * const { add, remove, props } = useScroll();
 * add(key, (props) => {});
 * remove(key);
 * props();
 * ```
 */
class Key extends Service {
  /** @type {Object} The event object. */
  event = {};

  /**
   * Used to accumulate the number of times the `keydown` event has been triggered.
   * @type {Number}
   */
  triggered = 0;

  /** @type {Object} The previous event object. */
  previousEvent = {};

  /**
   * Bind the handler to the scroll event.
   *
   * @return {void}
   */
  init() {
    this.handler = event => {
      this.event = event;
      this.trigger(this.props);
    };
    document.addEventListener('keydown', this.handler, { passive: true });
    document.addEventListener('keyup', this.handler, { passive: true });
  }

  /**
   * Unbind the handler from the scroll event.
   *
   * @return {void}
   */
  kill() {
    document.removeEventListener('keydown', this.handler);
    document.removeEventListener('keyup', this.handler);
  }

  /**
   * Get scroll props.
   *
   * @type {Object}
   */
  get props() {
    const keys = Object.entries(keyCodes).reduce((acc, [name, code]) => {
      acc[name] = code === this.event.keyCode;
      return acc;
    }, {});

    if (
      (this.event.type === 'keydown' && this.previousEvent.type === 'keydown') ||
      !this.previousEvent.type
    ) {
      if (!this.previousEvent.type) {
        this.triggered = 0;
      }
      this.triggered += 1;
    } else {
      this.triggered = 1;
    }

    this.previousEvent = this.event;

    return {
      event: this.event,
      direction: this.event.type === 'keydown' ? 'down' : 'up',
      triggered: this.triggered,
      ...keys,
    };
  }
}

let key = null;

export default () => {
  if (!key) {
    key = new Key();
  }

  const add = key.add.bind(key);
  const remove = key.remove.bind(key);
  const props = () => key.props;

  return {
    add,
    remove,
    props,
  };
};
