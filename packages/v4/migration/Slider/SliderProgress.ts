import { Base } from '../../src/index.js';
import { map } from '../../src/utils/maths.js';
import { SliderContext } from './Slider.js';

export interface SliderProgressProps {
  $refs: { progress: HTMLElement };
}

/**
 * SliderProgress — a progress bar for the Slider.
 *
 * Port of @studiometa/ui 1.10's `SliderProgress`. It translates its `progress`
 * ref from fully hidden to fully revealed as the active index walks the
 * slider's range.
 *
 * | v3 | v4 | why |
 * | -- | -- | --- |
 * | `extends AbstractSliderChild` | `extends Base` + one `$inject` | the base class was the handshake. |
 * | `slider.indexMax` through `$closest` | `total` from the provided state | the range is part of what the coordinator publishes, so this control needs no reference to the Slider at all — the only one of the four with nothing left to ask. |
 * | `domScheduler.read` / `.write` | `this.$read` / `this.$write` | the instance's scheduler lane, cancelled on destroy. |
 * | `transform(el, { x })` | one `style.transform` write | v4 ships no `transform` util, and there is no other transform on this element to preserve. |
 *
 * One v3 bug does not survive the port: `map(index, 0, indexMax, …)` divides by
 * `indexMax`, so a slider with a single slide produced `NaN` and an unparseable
 * transform. A range of one slide has no progress to show, hence the guard.
 */
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
