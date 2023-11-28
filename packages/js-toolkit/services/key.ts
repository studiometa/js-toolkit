/* eslint-disable no-use-before-define, @typescript-eslint/no-use-before-define */
import { useService } from './service.js';
import keyCodes from '../utils/keyCodes.js';
import type { ServiceInterface } from './index.js';

/**
 * Get initial key codes.
 */
function getInitialKeyCodes(): Record<keyof typeof keyCodes, false> {
  return Object.fromEntries(Object.keys(keyCodes).map((key) => [key, false])) as Record<
    keyof typeof keyCodes,
    false
  >;
}

export type KeyService = ServiceInterface<KeyServiceProps>;

export interface KeyServiceProps {
  event: KeyboardEvent;
  triggered: number;
  direction: 'up' | 'down' | 'none';
  isUp: boolean;
  isDown: boolean;
  ENTER: boolean;
  SPACE: boolean;
  TAB: boolean;
  ESC: boolean;
  LEFT: boolean;
  UP: boolean;
  RIGHT: boolean;
  DOWN: boolean;
}

/**
 * Create key service.
 */
function createKeyService(): KeyService {
  let previousEvent;

  /**
   * Update props.
   */
  function updateProps(event: KeyboardEvent): KeyServiceProps {
    props.event = event;

    for (const [name, code] of Object.entries(keyCodes)) {
      props[name] = code === event.keyCode;
    }

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
   * Trigger callbacks on keyboard event.
   */
  function onKey(event: KeyboardEvent) {
    trigger(updateProps(event));
  }

  const { add, remove, has, trigger, props } = useService({
    props: {
      event: null,
      triggered: 0,
      isUp: false,
      isDown: false,
      direction: 'none',
      ...getInitialKeyCodes(),
    } as KeyServiceProps,
    init() {
      document.addEventListener('keydown', onKey);
      document.addEventListener('keyup', onKey);
    },
    kill() {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('keyup', onKey);
    },
  });

  return {
    add,
    remove,
    has,
    props: () => props,
  };
}

let key;

/**
 * Use the keyboard service.
 */
export default function useKey(): KeyService {
  if (!key) {
    key = createKeyService();
  }

  return key;
}
