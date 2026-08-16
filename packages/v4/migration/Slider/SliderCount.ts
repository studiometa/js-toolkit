import { Base } from '../../src/index.js';
import { SliderContext } from './Slider.js';

export interface SliderCountProps {
  $refs: { current: HTMLElement; total: HTMLElement };
}

/** Displays the current slide number and optional total. */
export class SliderCount extends Base<SliderCountProps> {
  static config = { name: 'SliderCount', refs: ['current', 'total'] };

  async mounted() {
    const { state } = await this.$inject(SliderContext);
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
