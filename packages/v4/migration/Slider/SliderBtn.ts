import { Base } from '../../src/index.js';
import { SliderContext, type Slider } from './Slider.js';

export interface SliderBtnProps {
  $el: HTMLButtonElement;
  $options: { prev: boolean; next: boolean };
}

/**
 * SliderBtn — a previous/next control.
 *
 * Port of @studiometa/ui 1.10's `SliderBtn`, and the clearest illustration of
 * what `AbstractSliderChild` was for. v3 needed 143 lines of base class to
 * find its Slider and subscribe to its store, with a reconnection in
 * `mounted()`, `resized()` and `updated()` because none of them was reliable
 * on its own. Here it is one `$inject` in `mounted()` and the returned
 * unsubscribe.
 *
 * State comes through the context; *commands* do not. v4's provide/inject
 * carries a value signal only — DESIGN.md's "curated owner surface (`expose`
 * pattern)" is not implemented — so the click handler still resolves the
 * Slider with `$closest()`. That is fine at click time (the Slider is
 * mounted), but it means a control has two different ways of reaching its
 * parent.
 */
export class SliderBtn extends Base<SliderBtnProps> {
  static config = {
    name: 'SliderBtn',
    options: { prev: Boolean, next: Boolean },
  };

  get slider(): Slider | null {
    return this.$closest<Slider>('Slider');
  }

  async mounted() {
    const state = await this.$inject(SliderContext);
    return state.subscribe(
      ({ index, total }) => {
        this.$write(() => this.update(index, total));
      },
      { immediate: true },
    );
  }

  update(index: number, total: number): void {
    const isFirst = index === 0 && this.$options.prev;
    const isLast = index >= total - 1 && this.$options.next;
    this.$el.toggleAttribute('disabled', isFirst || isLast);
  }

  onClick(): void {
    if (this.$options.prev) {
      this.slider?.goPrev();
    } else if (this.$options.next) {
      this.slider?.goNext();
    }
  }
}
