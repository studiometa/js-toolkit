import type { ServiceConfig, ServiceInterface } from './AbstractService.js';
import { AbstractService } from './AbstractService.js';
import keyCodes from '../utils/keyCodes.js';

function getInitialKeyCodes(): Record<keyof typeof keyCodes, false> {
  return Object.fromEntries(Object.keys(keyCodes).map((key) => [key, false])) as Record<
    keyof typeof keyCodes,
    false
  >;
}

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

export type KeyServiceInterface = ServiceInterface<KeyServiceProps>;

export class KeyService extends AbstractService<KeyServiceProps> {
  static config: ServiceConfig = [[document, [['keydown'], ['keyup']]]];

  previousEvent: Event | null = null;

  props = {
    event: null,
    triggered: 0,
    isUp: false,
    isDown: false,
    direction: 'none',
    ...getInitialKeyCodes(),
  } as KeyServiceProps;

  updateProps(event: KeyboardEvent): KeyServiceProps {
    const { props } = this;

    props.event = event;

    for (const [name, code] of Object.entries(keyCodes)) {
      props[name] = code === event.keyCode;
    }

    if (!this.previousEvent) {
      props.triggered = 0;
    }

    if (props.event.type === 'keydown' && this.previousEvent?.type === 'keydown') {
      props.triggered += 1;
    } else {
      props.triggered = 1;
    }

    this.previousEvent = props.event;

    props.direction = props.event.type === 'keydown' ? 'down' : 'up';
    props.isUp = props.event.type === 'keyup';
    props.isDown = props.event.type === 'keydown';

    return props;
  }

  handleEvent(event: KeyboardEvent) {
    this.trigger(this.updateProps(event));
  }
}

/**
 * Use the keyboard service.
 */
export function useKey(): KeyServiceInterface {
  return KeyService.getInstance();
}
