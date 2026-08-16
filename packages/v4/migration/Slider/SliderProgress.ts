import { Base } from '../../src/index.js';
import { map } from '../../src/utils/maths.js';
import { SliderContext } from './Slider.js';

export interface SliderProgressProps {
  $refs: { progress: HTMLElement };
}

/** Progress bar that maps the active index across the published slide total. */
export class SliderProgress extends Base<SliderProgressProps> {
  static config = { name: 'SliderProgress', refs: ['progress'] };

  async mounted() {
    const { state } = await this.$inject(SliderContext);
    return state.subscribe(({ index, total }) => this.update(index, total), { immediate: true });
  }

  update(index: number, total: number): void {
    this.$read(() => {
      const { progress } = this.$refs;
      const indexMax = total - 1;
      const x = indexMax > 0 ? map(index, 0, indexMax, progress.clientWidth * -1, 0) : 0;
      this.$write(() => {
        progress.style.transform = `translate3d(${x}px, 0px, 0px)`;
      });
    });
  }
}
