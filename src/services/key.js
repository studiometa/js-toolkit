import Service from '../abstracts/Service';
import keyCodes from '../utils/keyCodes';

/**
 * @typedef {import('./index').ServiceInterface} ServiceInterface
 */

/**
 * @typedef {Object} KeyServiceProps
 * @property {KeyboardEvent} event
 * @property {Number} triggered
 * @property {Boolean} isUp
 * @property {Boolean} isDown
 * @property {Boolean} ENTER
 * @property {Boolean} SPACE
 * @property {Boolean} TAB
 * @property {Boolean} ESC
 * @property {Boolean} LEFT
 * @property {Boolean} UP
 * @property {Boolean} RIGHT
 * @property {Boolean} DOWN
 */

/**
 * @typedef {Object} KeyService
 * @property {(key:String, callback:(props:KeyServiceProps) => void) => void} add
 *   Add a function to the resize service. The key must be uniq.
 * @property {() => KeyServiceProps} props
 *   Get the current values of the resize service props.
 */

/**
 * Scroll service
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
   * @return {Key}
   */
  init() {
    this.handler = (event) => {
      this.event = event;
      this.trigger(this.props);
    };
    document.addEventListener('keydown', this.handler, { passive: false });
    document.addEventListener('keyup', this.handler, { passive: false });
    return this;
  }

  /**
   * Unbind the handler from the keyboard event.
   *
   * @return {Key}
   */
  kill() {
    document.removeEventListener('keydown', this.handler);
    document.removeEventListener('keyup', this.handler);
    return this;
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

/**
 * Use the keyboard service.
 *
 * ```js
 * import { useKey } from '@studiometa/js-toolkit/services';
 * const { add, remove, props } = useKey();
 * add(key, (props) => {});
 * remove(key);
 * props();
 * ```
 *
 * @return {ServiceInterface & KeyService}
 */
export default function useKey() {
  if (!key) {
    key = new Key();
  }

  const add = key.add.bind(key);
  const remove = key.remove.bind(key);
  const has = key.has.bind(key);
  const props = () => key.props;

  return {
    add,
    remove,
    has,
    props,
  };
}
