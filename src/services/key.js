import Service from '../abstracts/Service';
import keyCodes from '../utils/keyCodes';

/**
 * Scroll service
 *
 * ```
 * import { useKey } from '@studiometa/js-toolkit/services';
 * const { add, remove, props } = useKey();
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
   * Bind the handler to the keyboard event.
   *
   * @return {void}
   */
  init() {
    this.handler = event => {
      this.event = event;
      this.trigger(this.props);
    };
    document.addEventListener('keydown', this.handler, { passive: false });
    document.addEventListener('keyup', this.handler, { passive: false });
  }

  /**
   * Unbind the handler from the keyboard event.
   *
   * @return {void}
   */
  kill() {
    document.removeEventListener('keydown', this.handler);
    document.removeEventListener('keyup', this.handler);
  }

  /**
   * Get keyboard props.
   *
   * @type {Object}
   */
  get props() {
    const keys = Object.entries(keyCodes).reduce((acc, [name, code]) => {
      acc[name] = code === this.event.keyCode;
      return acc;
    }, {});

    if (!this.previousEvent.type) {
      this.triggered = 0;
    }

    if (this.event.type === 'keydown' && this.previousEvent.type === 'keydown') {
      this.triggered += 1;
    } else {
      this.triggered = 1;
    }

    this.previousEvent = this.event;

    return {
      event: this.event,
      triggered: this.triggered,
      direction: this.event.type === 'keydown' ? 'down' : 'up',
      isUp: this.event.type === 'keyup',
      isDown: this.event.type === 'keydown',
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
