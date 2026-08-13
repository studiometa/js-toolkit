import { Base } from '../../src/index.js';
import { SliderContext } from './Slider.js';

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
 * State *and* commands come through the context, which is what keeps the
 * control from knowing anything about the `Slider` class. The two halves are
 * resolved differently on purpose: the disabled state has to survive a control
 * that mounts first, so it waits on `$inject`; a click has to be answered now,
 * so it asks with `$injectSync` and does nothing when no slider is above it.
 */
export class SliderBtn extends Base<SliderBtnProps> {
  static config = {
    name: 'SliderBtn',
    options: { prev: Boolean, next: Boolean },
  };

  async mounted() {
    const { state } = await this.$inject(SliderContext);
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
    const api = this.$injectSync(SliderContext);
    if (this.$options.prev) {
      api?.goPrev();
    } else if (this.$options.next) {
      api?.goNext();
    }
  }
}
