import { Base, DRAG_MODES, withDrag, type DragProps, type MountedReturn } from '../../src/index.js';

export interface SliderDragProps {
  $emits: {
    start: DragProps;
    drag: DragProps;
    drop: DragProps;
    inertia: DragProps;
    stop: DragProps;
  };
}

/**
 * SliderDrag — the draggable track of the Slider.
 *
 * Port of @studiometa/ui 1.10's `SliderDrag`. Its job is unchanged: it owns no
 * geometry, it turns the drag service's lifecycle into component events and
 * lets the parent `Slider` decide what a gesture means. Dragging therefore
 * stays opt-in in the markup — a `Slider` with no `SliderDrag` child is a
 * button-driven carousel.
 *
 * Two things about the v4 drag service change the port:
 *
 * 1. **The mode is the whole state.** v3 read `isGrabbing`, `hasInertia` and a
 *    `distance` object off `$services.get('dragged')`; all of it is `mode` and
 *    the flat `distanceX`/`distanceY` props now. `mode` also gained `idle`,
 *    which is what the service reports *outside* a gesture — it is never
 *    emitted here, since an `idle` event would announce that nothing happened.
 * 2. **The scroll lock is the platform's.** v3 shipped a
 *    `scrollLockThreshold` option and an `onTouchmove` handler that called
 *    `preventDefault()` once a touch drag looked more horizontal than
 *    vertical. That heuristic is `touch-action: pan-y`, so the option and the
 *    handler are gone — see `mounted()`.
 */
export class SliderDrag extends withDrag(Base)<SliderDragProps> {
  static config = { name: 'SliderDrag' };

  /** Inline `touch-action` to put back, when this component set it. */
  #previousTouchAction: string | null = null;

  /**
   * Declare which gestures the browser may keep for itself.
   *
   * `pan-y` is v3's `shouldPreventScroll` heuristic — block the native gesture
   * once a drag is more horizontal than vertical — expressed as the platform
   * rule it was approximating: a vertical swipe scrolls the page, a horizontal
   * one is the slider's. It replaces both the `scrollLockThreshold` option and
   * the `onTouchmove` handler that read it.
   *
   * It has to be written **before** `super.mounted()`, which is where the
   * mixin subscribes: `useDrag` reads the computed `touch-action` once, on its
   * first subscriber, and writes `none` only when it finds `auto`. Setting it
   * here is therefore what stops the service from taking the vertical axis as
   * well — consumer CSS wins, and this counts as consumer CSS.
   */
  mounted(): MountedReturn {
    if (getComputedStyle(this.$el).touchAction === 'auto') {
      this.#previousTouchAction = this.$el.style.touchAction;
      this.$el.style.touchAction = 'pan-y';
    }

    return [
      super.mounted(),
      () => {
        if (this.#previousTouchAction !== null) {
          this.$el.style.touchAction = this.#previousTouchAction;
          this.#previousTouchAction = null;
        }
      },
    ];
  }

  /**
   * Re-emit the drag lifecycle for the parent Slider.
   *
   * The props object belongs to the service and is only valid for the duration
   * of this call, which `$emit` respects: `dispatchEvent` is synchronous, so
   * every delegated handler runs inside it. A listener that wants to keep the
   * props past its own handler copies them.
   */
  dragged(props: DragProps): void {
    if (props.mode === DRAG_MODES.IDLE) {
      return;
    }
    this.$emit(props.mode, props);
  }
}
