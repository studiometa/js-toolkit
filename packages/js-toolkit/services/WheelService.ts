import type { ServiceConfig, ServiceInterface } from './AbstractService.js';
import { AbstractService } from './AbstractService.js';
import { debounce } from '../utils/debounce.js';
import { PASSIVE_CAPTURE_EVENT_OPTIONS } from './utils.js';

type WheelServiceDirectionX = 'LEFT' | 'RIGHT' | 'NONE';
type WheelServiceDirectionY = 'UP' | 'DOWN' | 'NONE';
type WheelServiceMode = 'START' | 'WHEEL' | 'END';

export interface WheelServiceProps {
  MODES: {
    START: 'START';
    WHEEL: 'WHEEL';
    END: 'END';
  };
  mode: WheelServiceMode;
  event: WheelEvent;
  x: number;
  y: number;
  changedX: boolean;
  changedY: boolean;
  lastX: number;
  lastY: number;
  deltaX: number;
  deltaY: number;
  directionX: WheelServiceDirectionX;
  directionY: WheelServiceDirectionY;
  isUp: boolean;
  isRight: boolean;
  isDown: boolean;
  isLeft: boolean;
}

export type WheelServiceInterface = ServiceInterface<WheelServiceProps>;

export class WheelService extends AbstractService<WheelServiceProps> {
  static config: ServiceConfig = [[() => document, [['wheel', PASSIVE_CAPTURE_EVENT_OPTIONS]]]];

  shouldReset = true;

  props: WheelServiceProps = {
    MODES: {
      START: 'START',
      WHEEL: 'WHEEL',
      END: 'END',
    },
    mode: 'START',
    event: null,
    x: 0,
    y: 0,
    changedX: false,
    changedY: false,
    lastX: 0,
    lastY: 0,
    deltaX: 0,
    deltaY: 0,
    directionX: 'NONE',
    directionY: 'NONE',
    isUp: false,
    isRight: false,
    isDown: false,
    isLeft: false,
  };

  updateProps(event: WheelEvent): WheelServiceProps {
    const { props } = this;
    const yLast = props.y;
    const xLast = props.x;

    props.event = event;
    props.x -= event.deltaX;
    props.y -= event.deltaY;
    props.changedX = props.x !== xLast;
    props.changedY = props.y !== yLast;
    props.lastX = xLast;
    props.lastY = yLast;
    props.deltaX = event.deltaX;
    props.deltaY = event.deltaY;
    props.isUp = props.y < yLast;
    props.isRight = props.x > xLast;
    props.isDown = props.y > yLast;
    props.isLeft = props.x < xLast;
    /* eslint-disable no-nested-ternary */
    props.directionX = props.isRight ? 'RIGHT' : props.isLeft ? 'LEFT' : 'NONE';
    props.directionY = props.isDown ? 'DOWN' : props.isUp ? 'UP' : 'NONE';
    /* eslint-enable no-nested-ternary */

    return props;
  }

  update(event: WheelEvent) {
    this.updateProps(event);
    this.trigger(this.props);
  }

  onWheelDebounced = debounce((event: WheelEvent) => {
    this.props.mode = 'END';
    this.update(event);
    this.shouldReset = true;
  }, 100);

  /**
   * Event handler.
   */
  handleEvent(event: WheelEvent) {
    if (this.shouldReset) {
      this.shouldReset = false;
      this.props.mode = 'START';
      this.props.event = event;
      this.props.x = 0;
      this.props.y = 0;
      this.props.changedX = false;
      this.props.changedY = false;
      this.props.lastX = 0;
      this.props.lastY = 0;
      this.props.deltaX = 0;
      this.props.deltaY = 0;
      this.props.directionX = 'NONE';
      this.props.directionY = 'NONE';
      this.props.isUp = false;
      this.props.isRight = false;
      this.props.isDown = false;
      this.props.isLeft = false;
      this.trigger(this.props);
    }

    this.props.mode = 'WHEEL';
    this.update(event);
    this.onWheelDebounced(event);
  }
}

/**
 * Use the wheel service.
 *
 * ```js
 * import { useWheel } from '@studiometa/js-toolkit/services';
 * const { add, remove, props } = useWheel();
 * add(key, (props) => {});
 * remove(key);
 * props();
 * ```
 */
export function useWheel(): WheelServiceInterface {
  return WheelService.getInstance();
}
