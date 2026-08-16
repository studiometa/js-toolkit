import { Base, type RefEvent } from '../../src/index.js';
import {
  enterTransition,
  leaveTransition,
  TRANSITION_OPTIONS,
  type TransitionOptions,
} from '../../src/utils/transition.js';
import { SliderContext } from './Slider.js';

export interface SliderDotsProps {
  $refs: { dots: HTMLButtonElement[] };
  $options: TransitionOptions;
}

/** Pagination dots that transition on state changes and navigate on click. */
export class SliderDots extends Base<SliderDotsProps> {
  static config = {
    name: 'SliderDots',
    refs: ['dots[]'],
    options: { ...TRANSITION_OPTIONS },
  };

  currentIndex = -1;

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

    if (previous) {
      void leaveTransition(previous, this.$options);
    }
    if (next) {
      void enterTransition(next, this.$options);
    }
  }

  onDotsClick({ index }: RefEvent<HTMLButtonElement>): void {
    this.$injectSync(SliderContext)?.goTo(index);
  }
}
