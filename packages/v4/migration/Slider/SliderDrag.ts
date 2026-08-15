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

/** Optional draggable track that emits the drag lifecycle to its Slider. */
export class SliderDrag extends withDrag(Base)<SliderDragProps> {
  static config = { name: 'SliderDrag' };

  /** Inline `touch-action` to put back, when this component set it. */
  #previousTouchAction: string | null = null;

  /**
   * Preserve vertical page gestures. Set `touch-action` before the drag service
   * subscribes because it reads the computed value once.
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

  /** Re-emit non-idle drag modes. Copy props before retaining them asynchronously. */
  dragged(props: DragProps): void {
    if (props.mode === DRAG_MODES.IDLE) {
      return;
    }
    this.$emit(props.mode, props);
  }
}
