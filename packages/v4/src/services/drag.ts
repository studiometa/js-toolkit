import { clampDampFactor, DEFAULT_DAMP_FACTOR, inertiaFinalValue } from '../math.js';
import { scheduler } from '../scheduler.js';
import { createServiceMixin, type ServiceHandles, type ServiceMixinOptions } from './mixin.js';
import { createService, perTarget, type MutableProps, type Service } from './service.js';

/** Anything that can be grabbed: an HTML element, or an SVG one. */
export type DragTarget = HTMLElement | SVGElement;

/**
 * Where a drag is in its cycle:
 *
 * `idle` → `start` → `drag`… → `drop` → `inertia`… → `stop` → `idle`
 *
 * `idle` is the resting state, and what `props()` reports outside a gesture;
 * `stop` is the transition into it, announced once. Every other flag a
 * subscriber might want is a reading of this one — held is `START`/`DRAG`,
 * coasting is `INERTIA`.
 *
 * Named rather than left to string literals, because a literal union is
 * invisible to the audience this framework is built for: components written in
 * plain JavaScript with no build step get no completion and no warning from a
 * type. `DRAG_MODES.INERTIA` gives them both, and the type below is derived
 * from this object so there is one source of truth for the set.
 *
 *     dragged({ mode }) {
 *       if (mode === DRAG_MODES.DRAG) { … }
 *     }
 */
export const DRAG_MODES = {
  IDLE: 'idle',
  START: 'start',
  DRAG: 'drag',
  DROP: 'drop',
  INERTIA: 'inertia',
  STOP: 'stop',
} as const;

/**
 * One of {@link DRAG_MODES}. The literals still type-check, so
 * `mode === 'drag'` keeps working; the constants are what make the set
 * discoverable without a compiler.
 */
export type DragMode = (typeof DRAG_MODES)[keyof typeof DRAG_MODES];

/**
 * Props are flat, one per axis, the same `<name>X`/`<name>Y` spelling the
 * scroll and pointer services use.
 */
export interface DragProps {
  readonly mode: DragMode;
  /** Current position in the viewport. */
  readonly x: number;
  readonly y: number;
  /** Movement since the previous update. */
  readonly deltaX: number;
  readonly deltaY: number;
  /** Where the drag started. */
  readonly originX: number;
  readonly originY: number;
  /** Distance from the origin to the current position. */
  readonly distanceX: number;
  readonly distanceY: number;
  /** Position the inertia is heading to. */
  readonly finalX: number;
  readonly finalY: number;
}

export interface DragOptions {
  /** How fast the inertia decays, from `0` (none) to `1` (endless). */
  dampFactor?: number;
  /** Movement past which a drag stops counting as a click, in pixels. */
  dragThreshold?: number;
}

function createDragService(target: DragTarget, options: DragOptions): Service<DragProps> {
  // Normalised once, here, because the coast decays by this factor every tick
  // as well as summing it: `inertiaFinalValue()` guards its own argument, but
  // that would leave the per-tick decay running on whatever was passed in.
  const dampFactor = clampDampFactor(options.dampFactor ?? DEFAULT_DAMP_FACTOR);
  const dragThreshold = options.dragThreshold ?? 10;

  const props: MutableProps<DragProps> = {
    mode: DRAG_MODES.IDLE,
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
      /**
       * Armed by a drag that went past the threshold, disarmed by the next
       * `pointerdown`. The guard used to read `distance*` instead, which
       * survives the gesture that produced it — so after any real drag it
       * suppressed *every* later click on the target, for the life of the
       * page.
       */
      let isClickSuppressed = false;

      /** Held by the pointer: the two modes a gesture is alive in. */
      const isGrabbing = () => props.mode === DRAG_MODES.START || props.mode === DRAG_MODES.DRAG;

      // Without `touch-action: none` a native pan wins the gesture on touch:
      // the browser takes the pointer over and fires `pointercancel`, which
      // this service turns into an inertia fling from a half-finished drag.
      // Written only when the computed value is `auto` — anything the
      // consumer's CSS says about the target is deliberate and wins — and put
      // back as it was on teardown.
      const ownsTouchAction = getComputedStyle(target).touchAction === 'auto';
      const previousTouchAction = target.style.touchAction;
      if (ownsTouchAction) {
        target.style.touchAction = 'none';
      }

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
        props.mode = DRAG_MODES.STOP;
        emit(props);
        // `stop` is announced once; `idle` is what the props rest on.
        props.mode = DRAG_MODES.IDLE;
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
        props.mode = DRAG_MODES.INERTIA;
        emit(props);

        if (isRunning && Math.abs(props.deltaX) < 0.1 && Math.abs(props.deltaY) < 0.1) {
          stop();
        }
      }

      function startDrag(x: number, y: number) {
        if (isGrabbing()) {
          return;
        }
        stopInertia();
        props.x = props.originX = props.finalX = x;
        props.y = props.originY = props.finalY = y;
        props.deltaX = props.deltaY = 0;
        props.distanceX = props.distanceY = 0;
        props.mode = DRAG_MODES.START;
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
        props.mode = DRAG_MODES.DRAG;
        if (
          Math.abs(props.distanceX) > dragThreshold ||
          Math.abs(props.distanceY) > dragThreshold
        ) {
          isClickSuppressed = true;
        }
        emit(props);
      }

      function drop() {
        if (!isGrabbing()) {
          return;
        }
        document.removeEventListener('pointermove', onPointerMove);
        props.mode = DRAG_MODES.DROP;
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
          // A new gesture: whatever the previous one did, this one has not
          // dragged anywhere yet.
          isClickSuppressed = false;
          startDrag(pointerEvent.clientX, pointerEvent.clientY);
        }
      }

      function onDragStart(event: Event) {
        // The native drag-and-drop gesture would steal the pointer.
        event.preventDefault();
      }

      function onClick(event: Event) {
        // Only the click the browser synthesizes at the end of the gesture
        // this service just suppressed. A programmatic `.click()` is
        // untrusted, and keyboard activation of a link inside the target
        // arrives with `detail === 0` — neither is the tail of a drag, and
        // swallowing them made a dragged card's links unreachable.
        if (!isClickSuppressed || !event.isTrusted || (event as MouseEvent).detail === 0) {
          return;
        }
        // Dragging a link or a button must not follow it. Captured and
        // stopped immediately, before any handler down the tree sees it.
        event.stopImmediatePropagation();
        event.preventDefault();
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
        isClickSuppressed = false;
        if (ownsTouchAction) {
          target.style.touchAction = previousTouchAction;
        }
        stopInertia();
        // Losing every subscriber mid-drag ends the drag: staying in a
        // holding mode would make the next `pointerdown` a no-op once a
        // component subscribes again.
        props.mode = DRAG_MODES.IDLE;
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
 * const unsubscribe = useDrag(el).subscribe(({ mode, distanceX }) => {
 *   if (mode === DRAG_MODES.DRAG) {
 *     el.style.setProperty('--x', `${distanceX}px`);
 *   }
 * });
 * ```
 *
 * One service per element, so several components dragging the same target
 * share its listeners. The options of the first call are the ones that
 * apply.
 */
export function useDrag(target: DragTarget, options: DragOptions = {}): Service<DragProps> {
  return dragServices(target, options);
}

/** The method `withDrag()` subscribes for the component. */
export interface DragHook {
  dragged?(props: DragProps): void;
}

export type DragMixinOptions = DragOptions & ServiceMixinOptions<DragTarget>;

/**
 * Subscribe a component's `dragged()` method to the drag service, for its
 * whole mount cycle:
 *
 * ```js
 * class Card extends withDrag(Base) {
 *   dragged({ mode, distanceX }) {
 *     if (mode === DRAG_MODES.DRAG) {
 *       this.$el.style.setProperty('--x', `${distanceX}px`);
 *     }
 *   }
 * }
 *
 * // A handle inside the component, and a gentler inertia.
 * class Sheet extends withDrag(Base, {
 *   target: (instance) => instance.$refs.handle,
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
export const withDrag = /* @__PURE__ */ createServiceMixin<
  DragHook & ServiceHandles<'dragged'>,
  DragTarget,
  DragOptions
>({
  hook: 'dragged',
  target: (instance) => instance.$el,
  use: (target, options) => useDrag(target, options),
});
