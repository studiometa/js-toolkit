import {
  component,
  DRAG_MODES,
  withDrag,
  type BaseProps,
  type DragProps,
} from '../../src/index.js';
import { AbstractCarouselComponent } from './AbstractCarouselComponent.js';
import { getClosestIndex } from './utils.js';

/**
 * The draggable track, on the same element as the wrapper.
 *
 * It only reads the carousel, so it extends the non-subscribing base. v3 wraps
 * it in `withMountOnMediaQuery(..., '(pointer: fine)')`; v4 spells that
 * `mountStrategy: 'media:(pointer: fine)'` — the fourth decorator in this
 * exercise that turns out to be a string in a config object.
 */
@component({
  name: 'CarouselDrag',
  mountStrategy: 'media:(pointer: fine)',
})
export class CarouselDrag<T extends BaseProps = BaseProps> extends withDrag(
  AbstractCarouselComponent,
)<T> {
  dragged(props: DragProps): void {
    if (props.mode === DRAG_MODES.INERTIA || props.mode === DRAG_MODES.STOP) {
      return;
    }

    if (
      (this.isHorizontal && props.distanceX === 0) ||
      (this.isVertical && props.distanceY === 0)
    ) {
      return;
    }

    const wrapper = this.$el;

    if (props.mode === DRAG_MODES.DRAG) {
      // Scroll snapping has to come off, otherwise the track cannot be moved
      // to a position that is not a snap point.
      wrapper.style.scrollSnapType = 'none';
      wrapper.scrollTo({
        left: wrapper.scrollLeft - props.deltaX,
        top: wrapper.scrollTop - props.deltaY,
        behavior: 'instant',
      });
      return;
    }

    if (props.mode === DRAG_MODES.DROP) {
      this.snap(wrapper, props);
    }
  }

  /**
   * Snap to the slide the throw was heading for.
   *
   * v3 projects the throw itself, from the **last event's delta** times a
   * magic `-2.5` — a per-device quantity, so the same flick threw differently
   * on a 1000 Hz mouse and a 125 Hz trackpad. The service announces its exact
   * settle position at `drop` now, so the projected scroll offset is the
   * pointer's own projected travel, mirrored.
   */
  protected snap(wrapper: HTMLElement, props: DragProps): void {
    const { carousel } = this;
    if (!carousel) {
      return;
    }

    const positions = carousel.positions();
    const options: ScrollToOptions = { behavior: 'smooth' };

    if (this.isHorizontal) {
      const finalValue = wrapper.scrollLeft - (props.finalX - props.x);
      const index = getClosestIndex(
        positions.map((position) => position.left),
        finalValue,
      );
      options.left = positions[index]?.left;
    } else {
      const finalValue = wrapper.scrollTop - (props.finalY - props.y);
      const index = getClosestIndex(
        positions.map((position) => position.top),
        finalValue,
      );
      options.top = positions[index]?.top;
    }

    // Nothing to snap to — an empty carousel. Put scroll snapping back, since
    // the drag branch took it off, rather than scrolling to `undefined`.
    if (options.left === undefined && options.top === undefined) {
      wrapper.style.scrollSnapType = '';
      return;
    }

    wrapper.addEventListener(
      'scrollend',
      () => {
        wrapper.style.scrollSnapType = '';
      },
      { once: true },
    );
    wrapper.scrollTo(options);
  }
}
