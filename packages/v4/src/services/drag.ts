import { scheduler } from '../scheduler.js';
import { createServiceMixin, type ServiceMixinOptions } from './mixin.js';
import { createService, perTarget, type Service } from './service.js';

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
 *
 * The coast adds `delta`, then `delta · damp`, then `delta · damp²`…, so the
 * travel left is the geometric sum `delta / (1 - damp)`: one division,
 * instead of walking the decay term by term until a term fell under 0.1 px.
 *
 * It is also an **invariant** along the coast — after a tick the position has
 * gained `delta` and `delta` has been scaled by `damp`, which lands on the
 * same value — so the position the drop announces is the one the inertia
 * arrives at, and `stop()` snaps onto it rather than settling near it.
 */
function inertiaFinalValue(value: number, delta: number, dampFactor: number): number {
  return value + delta / (1 - dampFactor);
}

function createDragService(target: HTMLElement, options: DragOptions): Service<DragProps> {
  // A factor of 1 would never decay, and the settle position would be
  // infinitely far away.
  const dampFactor = Math.min(Math.max(options.dampFactor ?? 0.85, 0), 0.99999);
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
      /**
       * Publishing is re-entrant: a subscriber that unsubscribes while it is
       * being called can be the last one, and the service is then torn down
       * *inside* the `emit()` it is still in. Anything that touches state
       * after publishing has to ask whether the service it belongs to still
       * exists — otherwise the teardown that already ran cannot release it.
       */
      let isRunning = true;
      let unsubscribeTicks: (() => void) | null = null;

      function stopInertia() {
        unsubscribeTicks?.();
        unsubscribeTicks = null;
      }

      function stop() {
        stopInertia();
        // The settle position is exact and invariant along the coast, so the
        // drop's promise holds to the pixel instead of stopping a fraction
        // short of it.
        props.x = props.finalX;
        props.y = props.finalY;
        props.deltaX = 0;
        props.deltaY = 0;
        props.distanceX = props.x - props.originX;
        props.distanceY = props.y - props.originY;
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

        if (isRunning && Math.abs(props.deltaX) < 0.1 && Math.abs(props.deltaY) < 0.1) {
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
        if (!isRunning) {
          return;
        }
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
        // A component that unmounts on drop takes the last subscriber with
        // it: subscribing the inertia here would start a frame loop nothing
        // is left to release.
        if (!isRunning) {
          return;
        }
        unsubscribeTicks = scheduler.tick(tick);
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
        isRunning = false;
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

const dragServices = /* @__PURE__ */ perTarget(createDragService);

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
export const withDrag = /* @__PURE__ */ createServiceMixin<DragHook, HTMLElement, DragOptions>({
  hook: 'dragged',
  target: (instance) => instance.$el,
  use: (target, options) => useDrag(target, options),
});
