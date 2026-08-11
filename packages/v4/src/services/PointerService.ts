import { createService, type Service } from './Service.js';

export interface PointerProps {
  /** The event that produced these props, `null` before the first one. */
  event: PointerEvent | null;
  isDown: boolean;
  /** Position in the viewport. */
  x: number;
  y: number;
  last: { x: number; y: number };
  delta: { x: number; y: number };
  /** Viewport size. */
  max: { x: number; y: number };
  /** Position over the viewport, from `0` to `1`. */
  progress: { x: number; y: number };
}

/**
 * Pointer events unify mouse, touch and pen, so one set of listeners
 * replaces the six v3 needed — and `pointermove` carries the coordinates a
 * `TouchEvent` hid inside `touches[0]`.
 */
const EVENTS = ['pointermove', 'pointerdown', 'pointerup', 'pointercancel'] as const;

function createPointerService(): Service<PointerProps> {
  // Centered until the pointer says otherwise: a component reading
  // `progress` before the first move gets the middle of the viewport rather
  // than its top-left corner.
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2;
  const props: PointerProps = {
    event: null,
    isDown: false,
    x,
    y,
    last: { x, y },
    delta: { x: 0, y: 0 },
    max: { x: window.innerWidth, y: window.innerHeight },
    progress: { x: 0.5, y: 0.5 },
  };

  function update(event: PointerEvent): PointerProps {
    const lastX = props.x;
    const lastY = props.y;

    props.event = event;
    props.x = event.clientX;
    props.y = event.clientY;
    props.last.x = lastX;
    props.last.y = lastY;
    props.delta.x = props.x - lastX;
    props.delta.y = props.y - lastY;
    props.max.x = window.innerWidth;
    props.max.y = window.innerHeight;
    props.progress.x = props.x / props.max.x;
    props.progress.y = props.y / props.max.y;

    return props;
  }

  return createService<PointerProps>({
    props: () => props,
    start(emit) {
      const onPointer = (event: Event) => {
        const pointerEvent = event as PointerEvent;
        if (pointerEvent.type === 'pointermove') {
          emit(update(pointerEvent));
          return;
        }
        props.event = pointerEvent;
        props.isDown = pointerEvent.type === 'pointerdown';
        emit(props);
      };

      // Capture, so a component reads the pointer even when something down
      // the tree stops the event from propagating.
      for (const type of EVENTS) {
        document.addEventListener(type, onPointer, { passive: true, capture: true });
      }

      return () => {
        for (const type of EVENTS) {
          document.removeEventListener(type, onPointer, { capture: true });
        }
      };
    },
  });
}

let service: Service<PointerProps> | undefined;

/**
 * Use the pointer service.
 *
 * ```js
 * const unsubscribe = usePointer().add(({ progress, isDown }) => {
 *   el.style.setProperty('--x', String(progress.x));
 * });
 * ```
 *
 * Coordinates are always relative to the viewport. v3 accepted a target
 * element to translate them against; a component that needs element-relative
 * values subtracts its own box, which it has to measure anyway.
 */
export function usePointer(): Service<PointerProps> {
  service ??= createPointerService();
  return service;
}
