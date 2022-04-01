import Service from './Service.js';
import keyCodes from '../utils/keyCodes.js';

/**
 * @typedef {import('./index').ServiceInterface<KeyServiceProps>} KeyService
 */

/**
 * @typedef {Object} KeyServiceProps
 * @property {KeyboardEvent} event
 * @property {number} triggered
 * @property {'up'|'down'|'none'} direction
 * @property {boolean} isUp
 * @property {boolean} isDown
 * @property {boolean} ENTER
 * @property {boolean} SPACE
 * @property {boolean} TAB
 * @property {boolean} ESC
 * @property {boolean} LEFT
 * @property {boolean} UP
 * @property {boolean} RIGHT
 * @property {boolean} DOWN
 */

/**
 * Scroll service
 */
class Key extends Service {
  /** @type {KeyboardEvent} The previous event object. */
  previousEvent;

  /**
   * Props.
   * @type {KeyServiceProps}
   */
  props = {
    event: null,
    triggered: 0,
    isUp: false,
    isDown: false,
    ENTER: false,
    SPACE: false,
    TAB: false,
    ESC: false,
    LEFT: false,
    UP: false,
    RIGHT: false,
    DOWN: false,
    direction: 'none',
  };

  /**
   * Bind the handler to the keyboard event.
   *
   * @returns {void}
   */
  init() {
    document.addEventListener('keydown', this);
    document.addEventListener('keyup', this);
  }

  /**
   * Handle keyboard events.
   *
   * @param   {KeyboardEvent} event
   * @returns {void}
   */
  handleEvent(event) {
    this.updateProps(event);
    this.trigger(this.props);
  }

  /**
   * Unbind the handler from the keyboard event.
   *
   * @returns {void}
   */
  kill() {
    document.removeEventListener('keydown', this);
    document.removeEventListener('keyup', this);
  }

  /**
   * Get keyboard props.
   *
   * @param   {KeyboardEvent} event
   * @returns {this['props']}
   */
  updateProps(event) {
    this.props.event = event;

    Object.entries(keyCodes).forEach(([name, code]) => {
      this.props[name] = code === event.keyCode;
    });

    if (!this.previousEvent) {
      this.props.triggered = 0;
    }

    if (this.props.event.type === 'keydown' && this.previousEvent?.type === 'keydown') {
      this.props.triggered += 1;
    } else {
      this.props.triggered = 1;
    }

    this.previousEvent = this.props.event;

    this.props.direction = this.props.event.type === 'keydown' ? 'down' : 'up';
    this.props.isUp = this.props.event.type === 'keyup';
    this.props.isDown = this.props.event.type === 'keydown';

    return this.props;
  }
}

/**
 * @type {Key}
 */
let instance;

/**
 * @type {KeyService}
 */
let key;

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
 * @returns {KeyService}
 */
export default function useKey() {
  if (!key) {
    if (!instance) {
      instance = new Key();
    }

    key = {
      add: instance.add.bind(instance),
      remove: instance.remove.bind(instance),
      has: instance.has.bind(instance),
      props: instance.updateProps.bind(instance),
    };
  }
  return key;
}
