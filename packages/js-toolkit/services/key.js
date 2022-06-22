/* eslint-disable no-use-before-define */
import { useService } from './useService.js';
import keyCodes from '../utils/keyCodes.js';

let previousEvent;

/**
 * Update props
 * @returns {any}
 */
function updateProps(event) {
  props.event = event;

  Object.entries(keyCodes).forEach(([name, code]) => {
    props[name] = code === event.keyCode;
  });

  if (!previousEvent) {
    props.triggered = 0;
  }

  if (props.event.type === 'keydown' && previousEvent?.type === 'keydown') {
    props.triggered += 1;
  } else {
    props.triggered = 1;
  }

  previousEvent = props.event;

  props.direction = props.event.type === 'keydown' ? 'down' : 'up';
  props.isUp = props.event.type === 'keyup';
  props.isDown = props.event.type === 'keydown';

  return props;
}

/**
 * Desc.
 * @param   {KeyboardEvent} event
 * @returns {void}
 */
function onKey(event) {
  trigger(updateProps(event));
}

const { add, remove, has, trigger, props } = useService({
  initialProps: {
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
  },
  init() {
    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKey);
  },
  kill() {
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('keyup', onKey);
  },
});

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
    key = {
      add,
      remove,
      has,
      props: () => props,
    };
  }

  return key;
}
