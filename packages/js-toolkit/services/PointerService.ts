import { Service } from './Service.js';
import type { ServiceInterface } from './index.js';

export interface PointerServiceProps {
  event: MouseEvent | TouchEvent;
  isDown: boolean;
  x: number;
  y: number;
  changed: { x: boolean; y: boolean };
  last: { x: number; y: number };
  delta: { x: number; y: number };
  progress: { x: number; y: number };
  max: { x: number; y: number };
}

export type PointerServiceInterface = ServiceInterface<PointerServiceProps>;

export class PointerService extends Service<PointerServiceProps> {
  static events = ['mousemove', 'touchmove', 'mousedown', 'touchstart', 'mouseup', 'touchend'];

  target: HTMLElement | Window | undefined;

  props = {
    event: null,
    isDown: false,
    x: 0,
    y: 0,
    changed: {
      x: false,
      y: false,
    },
    last: {
      x: 0,
      y: 0,
    },
    delta: {
      x: 0,
      y: 0,
    },
    progress: {
      x: 0.5,
      y: 0.5,
    },
    max: {
      x: 0,
      y: 0,
    },
  } as PointerServiceProps;

  constructor(target: HTMLElement | undefined) {
    super();
    this.target = target;
    const targetSize = this.getTargetSize();
    this.props.x = this.props.last.x = targetSize.x / 2;
    this.props.y = this.props.last.y = targetSize.y / 2;
    this.props.max.x = targetSize.width;
    this.props.max.y = targetSize.height;
  }

  isTouchEvent(event: TouchEvent | MouseEvent): boolean {
    return typeof TouchEvent !== 'undefined' && event instanceof TouchEvent;
  }

  getTargetSize() {
    const { target } = this;
    return target instanceof Element
      ? target.getBoundingClientRect()
      : {
          width: window.innerWidth,
          height: window.innerHeight,
          x: 0,
          y: 0,
        };
  }

  /**
   * Update the pointer positions.
   */
  updateProps(event: MouseEvent | TouchEvent): PointerServiceProps {
    const { props } = this;

    props.event = event;
    const yLast = props.y;
    const xLast = props.x;

    const targetSize = this.getTargetSize();

    // Check pointer Y
    // We either get data from a touch event `event.touches[0].clientY` or from
    // a mouse event `event.clientY`.
    let y = this.isTouchEvent(event)
      ? (event as TouchEvent).touches[0]?.clientY
      : (event as MouseEvent).clientY;
    y -= targetSize.y;
    if (y !== props.y) {
      props.y = y;
    }

    // Check pointer X
    // We either get data from a touch event `event.touches[0].clientX` or from
    // a mouse event `event.clientX`.
    let x = this.isTouchEvent(event)
      ? (event as TouchEvent).touches[0]?.clientX
      : (event as MouseEvent).clientX;
    x -= targetSize.x;
    if (x !== props.x) {
      props.x = x;
    }

    props.changed.x = props.x !== xLast;
    props.changed.y = props.y !== yLast;

    props.last.x = xLast;
    props.last.y = yLast;

    props.delta.x = props.x - xLast;
    props.delta.y = props.y - yLast;

    props.max.x = targetSize.width;
    props.max.y = targetSize.height;

    props.progress.x = props.x / props.max.x;
    props.progress.y = props.y / props.max.y;

    return props;
  }

  /**
   * Handle events.
   *
   * @todo handle scroll as well
   */
  handleEvent(event: MouseEvent | TouchEvent) {
    // eslint-disable-next-line default-case
    switch (event.type) {
      case 'mouseenter':
      case 'mousemove':
      case 'touchmove':
        this.trigger(this.updateProps(event));
        break;
      case 'mousedown':
      case 'touchstart':
        this.props.isDown = true;
        this.trigger(this.props);
        break;
      case 'mouseup':
      case 'touchend':
        this.props.isDown = false;
        this.trigger(this.props);
        break;
    }
  }

  init() {
    document.documentElement.addEventListener('mouseenter', this, {
      once: true,
      capture: true,
    });

    const options = { passive: true, capture: true };
    for (const event of PointerService.events) {
      document.addEventListener(event, this, options);
    }
  }

  kill() {
    for (const event of PointerService.events) {
      document.removeEventListener(event, this);
    }
  }
}

/**
 * Use the pointer service.
 */
export function usePointer(target: HTMLElement | Window = window): PointerServiceInterface {
  return PointerService.getInstance(target, target);
}
