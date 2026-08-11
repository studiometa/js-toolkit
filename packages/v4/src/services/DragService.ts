import { scheduler } from '../scheduler.js';
import { createServiceMixin, type ServiceMixinOptions } from './mixin.js';
import { createService, perTarget, type Service } from './Service.js';

/**
 * Where a drag is in its cycle:
 *
 * `start` → `drag`… → `drop` → `inertia`… → `stop`
 */
export type DragMode = 'start' | 'drag' | 'drop' | 'inertia' | 'stop';

/**
 * Props are flat, one per axis, the same `<name>X`/`<name>Y` spelling the
 * scroll and pointer services use.
 */
export interface DragProps {
  mode: DragMode;
  target: HTMLElement;
  /** Whether the pointer is currently holding the target. */
  isGrabbing: boolean;
  /** Whether the drag is coasting after the drop. */
  hasInertia: boolean;
  /** Current position in the viewport. */
  x: number;
  y: number;
  /** Movement since the previous update. */
  deltaX: number;
  deltaY: number;
  /** Where the drag started. */
  originX: number;
  originY: number;
  /** Distance from the origin to the current position. */
  distanceX: number;
  distanceY: number;
  /** Position the inertia is heading to. */
  finalX: number;
  finalY: number;
}

export interface DragOptions {
  /** How fast the inertia decays, from `0` (none) to `1` (endless). */
  dampFactor?: number;
  /** Movement past which a drag stops counting as a click, in pixels. */
  dragThreshold?: number;
}

/**
 * Where a damped value ends up once its delta has decayed to nothing —
 * known at drop time, so a component can animate straight to it instead of
 * following the inertia frame by frame.
 */
function inertiaFinalValue(value: number, delta: number, dampFactor: number): number {
  let final = value;
  let current = delta;
  while (Math.abs(current) > 0.1) {
    final += current;
    current *= dampFactor;
  }
  return final;
}

function createDragService(target: HTMLElement, options: DragOptions): Service<DragProps> {
  // A factor of 1 would never decay, and `inertiaFinalValue` would not end.
  const dampFactor = Math.min(Math.max(options.dampFactor ?? 0.85, 0.00001), 0.99999);
  const dragThreshold = options.dragThreshold ?? 10;

  const props: DragProps = {
    mode: 'stop',
    target,
    isGrabbing: false,
    hasInertia: false,
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    originX: 0,
    originY: 0,
    distanceX: 0,
    distanceY: 0,
    finalX: 0,
    finalY: 0,
  };

  return createService<DragProps>({
    props: () => props,
    start(emit) {
      let unsubscribeFrames: (() => void) | null = null;

      function stopInertia() {
        unsubscribeFrames?.();
        unsubscribeFrames = null;
      }

      function stop() {
        stopInertia();
        props.isGrabbing = false;
        props.hasInertia = false;
        props.mode = 'stop';
        emit(props);
      }

      // The inertia runs on the scheduler's frame tick, like every other
      // continuous source in v4 — v3 borrowed the raf service for it.
      function tick() {
        props.x += props.deltaX;
        props.y += props.deltaY;
        props.distanceX = props.x - props.originX;
        props.distanceY = props.y - props.originY;
        props.deltaX *= dampFactor;
        props.deltaY *= dampFactor;
        props.mode = 'inertia';
        emit(props);

        if (Math.abs(props.deltaX) < 0.1 && Math.abs(props.deltaY) < 0.1) {
          stop();
        }
      }

      function startDrag(x: number, y: number) {
        if (props.isGrabbing) {
          return;
        }
        stopInertia();
        props.x = props.originX = props.finalX = x;
        props.y = props.originY = props.finalY = y;
        props.deltaX = props.deltaY = 0;
        props.distanceX = props.distanceY = 0;
        props.isGrabbing = true;
        props.hasInertia = false;
        props.mode = 'start';
        emit(props);
        document.addEventListener('pointermove', onPointerMove, { passive: true });
      }

      function drag(event: PointerEvent) {
        props.deltaX = event.clientX - props.x;
        props.deltaY = event.clientY - props.y;
        props.x = props.finalX = event.clientX;
        props.y = props.finalY = event.clientY;
        props.distanceX = props.x - props.originX;
        props.distanceY = props.y - props.originY;
        props.mode = 'drag';
        emit(props);
      }

      function drop() {
        if (!props.isGrabbing) {
          return;
        }
        document.removeEventListener('pointermove', onPointerMove);
        props.isGrabbing = false;
        props.hasInertia = true;
        props.mode = 'drop';
        props.finalX = inertiaFinalValue(props.x, props.deltaX, dampFactor);
        props.finalY = inertiaFinalValue(props.y, props.deltaY, dampFactor);
        emit(props);
        unsubscribeFrames = scheduler.frame(tick);
      }

      function onPointerMove(event: Event) {
        const pointerEvent = event as PointerEvent;
        // The button was released outside the window, or a gesture took the
        // pointer over: there is nothing left to follow.
        if (pointerEvent.buttons === 1) {
          drag(pointerEvent);
        } else {
          drop();
        }
      }

      function onPointerDown(event: Event) {
        const pointerEvent = event as PointerEvent;
        if (pointerEvent.button === 0) {
          startDrag(pointerEvent.clientX, pointerEvent.clientY);
        }
      }

      function onDragStart(event: Event) {
        // The native drag-and-drop gesture would steal the pointer.
        event.preventDefault();
      }

      function onClick(event: Event) {
        if (
          Math.abs(props.distanceX) > dragThreshold ||
          Math.abs(props.distanceY) > dragThreshold
        ) {
          // Dragging a link or a button must not follow it. Captured and
          // stopped immediately, before any handler down the tree sees it.
          event.stopImmediatePropagation();
          event.preventDefault();
        }
      }

      function onPointerUp() {
        drop();
      }

      target.addEventListener('pointerdown', onPointerDown, { passive: true });
      target.addEventListener('dragstart', onDragStart, { capture: true });
      target.addEventListener('click', onClick, { capture: true });
      // On the window: a pointer released outside the target still ends the
      // drag.
      window.addEventListener('pointerup', onPointerUp, { passive: true });
      window.addEventListener('pointercancel', onPointerUp, { passive: true });

      return () => {
        stopInertia();
        // Losing every subscriber mid-drag ends the drag: leaving
        // `isGrabbing` on would make the next `pointerdown` a no-op once a
        // component subscribes again.
        props.isGrabbing = false;
        props.hasInertia = false;
        props.mode = 'stop';
        document.removeEventListener('pointermove', onPointerMove);
        target.removeEventListener('pointerdown', onPointerDown);
        target.removeEventListener('dragstart', onDragStart, { capture: true });
        target.removeEventListener('click', onClick, { capture: true });
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
      };
    },
  });
}

const dragServices = perTarget(createDragService);

/**
 * Use the drag service for an element.
 *
 * ```js
 * const unsubscribe = useDrag(el).add(({ mode, distanceX }) => {
 *   if (mode === 'drag') {
 *     el.style.setProperty('--x', `${distanceX}px`);
 *   }
 * });
 * ```
 *
 * One service per element, so several components dragging the same target
 * share its listeners. The options of the first call are the ones that
 * apply.
 */
export function useDrag(target: HTMLElement, options: DragOptions = {}): Service<DragProps> {
  return dragServices(target, options);
}

/** The method `withDrag()` subscribes for the component. */
export interface DragHook {
  dragged?(props: DragProps): void;
}

export type DragMixinOptions = DragOptions & ServiceMixinOptions<HTMLElement>;

/**
 * Subscribe a component's `dragged()` method to the drag service, for its
 * whole mount cycle:
 *
 * ```js
 * class Card extends withDrag(Base) {
 *   dragged({ mode, distanceX }) {
 *     if (mode === 'drag') {
 *       this.$el.style.setProperty('--x', `${distanceX}px`);
 *     }
 *   }
 * }
 *
 * // A handle inside the component, and a gentler inertia.
 * class Sheet extends withDrag(Base, {
 *   target: (instance) => instance.$el.querySelector('.handle'),
 *   dampFactor: 0.95,
 * }) {
 *   dragged(props) { … }
 * }
 * ```
 *
 * The component's root element is the default target — the one hook whose
 * default is the host, as Lit's `ResizeController` does. The decorator form
 * `@withDrag()` is the same thing with a build step.
 */
export const withDrag = createServiceMixin<DragHook, HTMLElement, DragOptions>({
  hook: 'dragged',
  target: (instance) => instance.$el,
  use: (target, options) => useDrag(target, options),
});
