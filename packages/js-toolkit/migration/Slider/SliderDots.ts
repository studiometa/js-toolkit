import { Base, type RefEvent } from '../../src/index.js';
import { withTransition, type TransitionProps } from '../Transition/index.js';
import { SliderContext } from './Slider.js';

export type SliderDotsProps = TransitionProps & {
  $refs: { dots: HTMLButtonElement[] };
};

/**
 * Pagination dots that transition on state changes and navigate on click.
 *
 * The canonical consumer of both halves of `withTransition`'s target surface:
 * `target` returns the whole `dots` ref list, and `update()` names one dot per
 * call so the outgoing one leaves while the incoming one enters. v3 is
 * `withTransition(AbstractSliderChild)` and does exactly this.
 */
export class SliderDots extends withTransition(Base)<SliderDotsProps> {
  static config = {
    name: 'SliderDots',
    refs: ['dots[]'],
  };

  currentIndex = -1;

  /** Every dot. One call at a time overrides it with a single one. */
  get target(): HTMLButtonElement[] {
    return this.$refs.dots;
  }

  async mounted() {
    const { state } = await this.$inject(SliderContext);
    return state.subscribe(({ index }) => this.update(index), { immediate: true });
  }

  update(index: number): void {
    if (index === this.currentIndex) {
      return;
    }

    const previous = this.$refs.dots[this.currentIndex];
    const next = this.$refs.dots[index];
    this.currentIndex = index;

    // Guarded, unlike v3: the first update runs with `currentIndex` at `-1`,
    // and v3 hands the resulting `undefined` to `Array.from()` inside its
    // transition util, which throws.
    if (previous) {
      void this.leave(previous);
    }
    if (next) {
      void this.enter(next);
    }
  }

  onDotsClick({ index }: RefEvent<HTMLButtonElement>): void {
    this.$injectSync(SliderContext)?.goTo(index);
  }
}
