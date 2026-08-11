import { Base } from '../../src/index.js';
import { SliderContext } from './Slider.js';

export interface SliderCountProps {
  $refs: { current: HTMLElement; total: HTMLElement };
}

/**
 * SliderCount — the slide counter.
 *
 * Port of @studiometa/ui 1.10's `SliderCount`. v3 only wrote the current
 * index, because the store carried nothing else; the provided signal carries
 * the total too, so an optional `total` ref costs nothing.
 */
export class SliderCount extends Base<SliderCountProps> {
  static config = { name: 'SliderCount', refs: ['current', 'total'] };

  async mounted() {
    const state = await this.$inject(SliderContext);
    return state.subscribe(
      ({ index, total }) => {
        this.$write(() => {
          this.$refs.current.textContent = String(index + 1);
          if (this.$refs.total) {
            this.$refs.total.textContent = String(total);
          }
        });
      },
      { immediate: true },
    );
  }
}
