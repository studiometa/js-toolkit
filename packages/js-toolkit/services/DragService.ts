import { Service } from './Service.js';
import { useRaf } from './RafService.js';
import { isDefined, inertiaFinalValue } from '../utils/index.js';
import type { ServiceInterface } from './index.js';

type DragLifecycle = 'start' | 'drag' | 'drop' | 'inertia' | 'stop';

export interface DragServiceProps {
  /**
   * The current mode of the dragging logic.
   */
  mode: DragLifecycle;
  /**
   * The target element of the drag.
   */
  target: HTMLElement;
  /**
   * Whether the user is currently grabbing the targeted element or not.
   */
  isGrabbing: boolean;
  /**
   * Whether the drag currently has inertia or not.
   */
  hasInertia: boolean;
  /**
   * The current horizontal position in the viewport.
   */
  x: number;
  /**
   * The current vertical position in the viewport.
   */
  y: number;
  /**
   * The delta between the current position and the last.
   */
  delta: { x: number; y: number };
  /**
   * The initial position where the dragging started.
   */
  origin: { x: number; y: number };
  /**
   * The distance from the current position to the origin.
   */
  distance: { x: number; y: number };
  /**
   * The final position that will be reached at the end of the inertia.
   */
  final: { x: number; y: number };
}

export type DragServiceInterface = ServiceInterface<DragServiceProps>;

export interface DragServiceOptions {
  dampFactor?: number;
  dragTreshold?: number;
}

let count = 0;

export class DragService extends Service<DragServiceProps> {
  static targetEvents = ['pointerdown'];
  static windowEvents = ['pointerup', 'touchend'];
  static passiveEventOptions = { passive: true };
  static MODES: Record<Uppercase<DragLifecycle>, DragLifecycle> = {
    START: 'start',
    DRAG: 'drag',
    DROP: 'drop',
    INERTIA: 'inertia',
    STOP: 'stop',
  };

  id: string;

  dampFactor = 0.85;

  dragTreshold = 10;

  previousEvent: TouchEvent | MouseEvent = null;

  props = {
    target: null,
    mode: undefined,
    isGrabbing: false,
    hasInertia: false,
    x: 0,
    y: 0,
    delta: {
      x: 0,
      y: 0,
    },
    origin: {
      x: 0,
      y: 0,
    },
    distance: {
      x: 0,
      y: 0,
    },
    final: {
      x: 0,
      y: 0,
    },
  } as DragServiceProps;

  /**
   * Test if we should allow click on links and buttons.
   */
  get shouldPreventClick(): boolean {
    return (
      Math.abs(this.props.distance.x) > this.dragTreshold ||
      Math.abs(this.props.distance.y) > this.dragTreshold
    );
  }

  constructor(
    target: HTMLElement,
    { dampFactor = 0.85, dragTreshold = 10 }: DragServiceOptions = {},
  ) {
    super();
    count += 1;
    this.id = `drag-${count}`;
    this.dampFactor = dampFactor;
    this.dragTreshold = dragTreshold;
    this.props.target = target;
  }

  init() {
    const { target } = this.props;

    for (const event of DragService.targetEvents) {
      target.addEventListener(event, this, DragService.passiveEventOptions);
    }
    for (const event of DragService.windowEvents) {
      window.addEventListener(event, this, DragService.passiveEventOptions);
    }
    target.addEventListener('dragstart', this, { capture: true });
    target.addEventListener('click', this, { capture: true });
  }

  kill() {
    const { target } = this.props;

    for (const event of DragService.targetEvents) {
      target.removeEventListener(event, this);
    }
    for (const event of DragService.windowEvents) {
      window.removeEventListener(event, this);
    }
    target.removeEventListener('dragstart', this);
    target.removeEventListener('click', this);
  }

  /**
   * Get the client value for the given axis.
   */
  getEventPosition(event: MouseEvent | TouchEvent): { x: number; y: number } {
    // @ts-ignore
    const eventOrTouch = isDefined(event.touches) ? event.touches[0] : event;
    return {
      x: eventOrTouch.clientX,
      y: eventOrTouch.clientY,
    };
  }

  /**
   * Start the drag.
   *
   * @param {number} x The initial horizontal position.
   * @param {number} y The initial vertical position.
   * @returns {void}
   */
  start(x: number, y: number) {
    const { props } = this;
    if (props.isGrabbing) {
      return;
    }

    // Reset state
    props.x = x;
    props.y = y;
    props.origin.x = x;
    props.origin.y = y;
    props.delta.x = 0;
    props.delta.y = 0;
    props.distance.x = 0;
    props.distance.y = 0;
    props.final.x = x;
    props.final.y = y;

    props.mode = DragService.MODES.START;

    // Enable grabbing
    props.isGrabbing = true;

    this.trigger(props);

    document.addEventListener('touchmove', this, DragService.passiveEventOptions);
    document.addEventListener('mousemove', this, DragService.passiveEventOptions);
  }

  /**
   * Stop the drag, or drop.
   */
  drop() {
    const { props, dampFactor, id } = this;
    document.removeEventListener('touchmove', this);
    document.removeEventListener('mousemove', this);
    props.isGrabbing = false;
    props.mode = DragService.MODES.DROP;

    props.hasInertia = true;
    props.final.x = inertiaFinalValue(props.x, props.delta.x, dampFactor);
    props.final.y = inertiaFinalValue(props.y, props.delta.y, dampFactor);

    this.previousEvent = null;

    this.trigger(props);

    setTimeout(() => {
      const raf = useRaf();
      raf.remove(id);
      raf.add(id, () => this.rafHandler());
    }, 0);
  }

  /**
   * Stop the drag.
   */
  stop() {
    const { props, id } = this;

    useRaf().remove(id);
    props.isGrabbing = false;
    props.hasInertia = false;
    props.mode = DragService.MODES.STOP;
    this.trigger(props);
  }

  /**
   * Raf service handler.
   */
  rafHandler() {
    const { props, dampFactor } = this;

    if (!props.isGrabbing) {
      props.x += props.delta.x;
      props.y += props.delta.y;
      props.distance.x = props.x - props.origin.x;
      props.distance.y = props.y - props.origin.y;

      props.delta.x *= dampFactor;
      props.delta.y *= dampFactor;

      if (props.mode !== DragService.MODES.INERTIA) {
        props.mode = DragService.MODES.INERTIA;
      }

      this.trigger(props);

      if (Math.abs(props.delta.x) < 0.1 && Math.abs(props.delta.y) < 0.1) {
        this.stop();
      }
    }
  }

  /**
   * Pointer service handler.
   */
  drag(event: TouchEvent | MouseEvent) {
    const { props } = this;

    if (props.isGrabbing) {
      const position = this.getEventPosition(event);
      props.x = position.x;
      props.y = position.y;

      if (this.previousEvent) {
        const previousPosition = this.getEventPosition(this.previousEvent);
        props.delta.x = position.x - previousPosition.x;
        props.delta.y = position.y - previousPosition.y;
      }

      props.final.x = position.x;
      props.final.y = position.y;
      props.distance.x = props.x - props.origin.x;
      props.distance.y = props.y - props.origin.y;

      if (props.mode !== DragService.MODES.DRAG) {
        props.mode = DragService.MODES.DRAG;
      }

      this.trigger(props);
      this.previousEvent = event;
    }
  }

  /**
   * Handle any event.
   */
  handleEvent(event: MouseEvent | PointerEvent | DragEvent) {
    switch (event.type) {
      case 'dragstart':
        event.preventDefault();
        break;
      case 'click':
        if (this.shouldPreventClick) {
          event.stopImmediatePropagation();
          event.stopPropagation();
          event.preventDefault();
        }
        break;
      case 'pointerup':
      case 'touchend':
        this.drop();
        break;
      case 'touchmove':
      case 'mousemove':
        this.drag(event);
        break;
      default:
        if (event.button === 0) {
          this.start(event.x, event.y);
        }
    }
  }
}

/**
 * Use the drag service.
 *
 * ```js
 * import { useDrag } from '@studiometa/js-toolkit/services';
 * const { add, remove, props } = useDrag();
 * const draggableElement = document.querySelector('.draggable');
 * add(draggableElement, (props) => {}, { factor: 0.8 });
 * remove(draggableElement);
 * props(draggableElement);
 * ```
 */
export function useDrag(target: HTMLElement, options: DragServiceOptions): DragServiceInterface {
  return DragService.getInstance<DragServiceInterface>(target, target, options);
}