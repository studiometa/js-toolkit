import { Base, type RefEvent } from '../../src/index.js';
import {
  enterTransition,
  leaveTransition,
  TRANSITION_OPTIONS,
  type TransitionOptions,
} from '../utils/transition.js';
import { SliderContext } from './Slider.js';

export interface SliderDotsProps {
  $refs: { dots: HTMLButtonElement[] };
  $options: TransitionOptions;
}

/**
 * SliderDots — pagination dots.
 *
 * Port of @studiometa/ui 1.10's `SliderDots`. The behaviour is v3's: the dot
 * for the active slide runs the enter transition, the one leaving runs the
 * leave transition, and a click navigates to the dot's own index. The markup
 * is v3's too — one `dots[]` ref per dot, the eight transition classes as
 * options on this element.
 *
 * | v3 | v4 | why |
 * | -- | -- | --- |
 * | `extends withTransition(AbstractSliderChild)` | `extends Base` | both halves of that chain are gone: `AbstractSliderChild` is `$inject`, and `withTransition` is a component in v4, which cannot be mixed in. Its two useful functions are shared through `utils/transition.ts`. |
 * | `this.slider.goTo(index)` | `$injectSync(SliderContext)?.goTo(index)` | the coordinator is reached through its provided surface, not by class. |
 * | `update(index)` scheduled by `AbstractSliderChild.__updateWith` | the signal subscription calls it | one channel instead of a base class scheduling `domScheduler.read`/`write` around it. |
 *
 * `currentIndex` starts at `-1` so the first update always enters a dot, as in
 * v3 — where `this.$refs.dots[-1]` was then handed to `leave()`. Here that is
 * an explicit guard, since the shared function takes one element.
 */
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
      leaveTransition(previous, this.$options);
    }
    if (next) {
      enterTransition(next, this.$options);
    }
  }

  onDotsClick({ index }: RefEvent<HTMLButtonElement>): void {
    this.$injectSync(SliderContext)?.goTo(index);
  }
}
