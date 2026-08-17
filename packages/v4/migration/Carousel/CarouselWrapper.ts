import { withResize, type BaseConfig, type BaseProps, type MountedReturn } from '../../src/index.js';
import { clamp } from '../../src/utils/maths.js';
import { AbstractCarouselComponent } from './AbstractCarouselComponent.js';
import { getClosestIndex } from './utils.js';

/**
 * The scrollable track.
 *
 * It scrolls to an item on demand through `scrollToIndex()`, which the
 * coordinator calls, and on a native or touch scroll it only **reports** the
 * closest item back. Because a scroll is only ever started by `goTo()` and
 * `onScroll` never scrolls, the feedback loop that would hijack a smooth
 * scroll cannot form and no synchronising guard is needed.
 */
export class CarouselWrapper<T extends BaseProps = BaseProps> extends withResize(
  AbstractCarouselComponent,
)<T> {
  static config: BaseConfig = {
    name: 'CarouselWrapper',
  };

  /**
   * `scrollWidth - clientWidth` and its vertical twin. `progress` runs every
   * frame, so these layout reads are cached and cleared with the mount cycle,
   * on a resize, and whenever the coordinator's item list changes.
   */
  #scrollDistance: { x: number; y: number } | null = null;

  mounted(): MountedReturn {
    return [
      super.mounted(),
      () => {
        this.#scrollDistance = null;
      },
    ];
  }

  get scrollDistance(): { x: number; y: number } {
    if (!this.#scrollDistance) {
      const { scrollWidth, clientWidth, scrollHeight, clientHeight } = this.$el;
      // Browsers report fractional scroll sizes, so the last item can settle a
      // sub-pixel short and keep progress from ever reaching a clean `1`.
      this.#scrollDistance = {
        x: Math.round(scrollWidth - clientWidth),
        y: Math.round(scrollHeight - clientHeight),
      };
    }

    return this.#scrollDistance;
  }

  /** Current progress, from `0` to `1`. */
  get progress(): number {
    const { x, y } = this.scrollDistance;

    if (this.isHorizontal) {
      return x === 0 ? 0 : clamp(Math.round(this.$el.scrollLeft) / x, 0, 1);
    }

    return y === 0 ? 0 : clamp(Math.round(this.$el.scrollTop) / y, 0, 1);
  }

  /** Drop the cached distances. Called on resize and when the items change. */
  invalidate(): void {
    this.#scrollDistance = null;
  }

  resized(): void {
    this.invalidate();
  }

  /** Scroll to the item at the given index, if there is one. */
  scrollToIndex(index: number): void {
    const position = this.carousel?.positions()[index];
    if (position) {
      this.$el.scrollTo({ left: position.left, top: position.top, behavior: 'smooth' });
    }
  }

  /**
   * Report the scroll-synced index and keep the progress loop running.
   *
   * The loop has to be restarted here because it stops itself once progress
   * settles: without it the `progress` event and `--carousel-progress` would
   * freeze during any scroll `goTo()` did not start, touch scrolling included.
   */
  onScroll(): void {
    const { carousel, isHorizontal, $el } = this;
    if (!carousel) {
      return;
    }

    const positions = carousel.positions();
    const index = getClosestIndex(
      positions.map((position) => (isHorizontal ? position.left : position.top)),
      isHorizontal ? $el.scrollLeft : $el.scrollTop,
    );

    carousel.reportIndex(index);
    carousel.keepTicking();
  }
}
