import { Base, defaultScheduler, type BaseConfig } from '../../src/index.js';
import { applyStyles, compile, type Keyframe, type KeyframeStyles } from '../utils/keyframes.js';
import { clamp01, map } from '../../src/utils/maths.js';
import type { ScrollInViewProps, ScrolledInViewRender } from './withScrolledInView.js';

export interface AbstractScrollAnimationProps {
  $options: {
    playRange: [number, number] | [number, number, number];
    from: Keyframe;
    to: Keyframe;
    keyframes: Keyframe[];
    easing: [number, number, number, number];
  };
}

/** Shared base for scroll-linked keyframe animations. */
export class AbstractScrollAnimation extends Base<AbstractScrollAnimationProps> {
  static config: BaseConfig = {
    name: 'AbstractScrollAnimation',
    options: {
      playRange: { type: Array, default: () => [0, 1] },
      from: { type: Object, default: () => ({}) },
      to: { type: Object, default: () => ({}) },
      keyframes: { type: Array, default: () => [] },
      easing: { type: Array, default: () => [0, 0, 1, 1] },
    },
  };

  /** Current animation progress, 0 to 1. */
  progress = 0;

  #interpolate:
    | ((progress: number, size: { width: number; height: number }) => KeyframeStyles)
    | null = null;

  /** The element the styles are written to. */
  get target(): HTMLElement {
    return this.$el;
  }

  get interpolate(): (progress: number, size: { width: number; height: number }) => KeyframeStyles {
    if (!this.#interpolate) {
      const { from, to } = this.$options;
      let { keyframes } = this.$options;
      if (!keyframes || keyframes.length <= 0) {
        keyframes = [from, to];
      }
      this.#interpolate = compile(keyframes, { easing: this.$options.easing });
    }
    return this.#interpolate;
  }

  /** The three-value form `[index, length, step]` creates staggered ranges. */
  get playRange(): [number, number] {
    const { playRange } = this.$options;

    if (playRange.length === 3) {
      const [index, length, step] = playRange;
      const clampedStep = clamp01(step);
      const start = clampedStep * index;
      const duration = Math.max(0, 1 - clampedStep * (length - 1));
      return [start, Math.min(1, start + duration)];
    }

    const [start = 0, end = 1] = playRange;
    return [start, end];
  }

  mounted(): void {
    this.renderNow(this.progress);
  }

  destroyed(): void {
    this.renderNow(Math.round(this.progress));
  }

  /**
   * Render outside a `scrolledInView()` pass. Measuring stays in `read` and
   * writing in `write`, and neither is instance-owned: `$destroy()` cancels
   * the instance's pending tasks straight after the cleanups, which would
   * drop the boundary render this schedules.
   */
  renderNow(progress: number): void {
    defaultScheduler.read(() => defaultScheduler.write(this.render(progress)));
  }

  scrolledInView({ dampedProgressY }: ScrollInViewProps): ScrolledInViewRender {
    const [start, end] = this.playRange;
    return this.render(clamp01(map(dampedProgressY, start, end, 0, 1)));
  }

  /** Compute styles now and return the deferred DOM write. */
  render(progress: number): ScrolledInViewRender {
    this.progress = progress;
    const { target } = this;
    const styles = this.interpolate(progress, {
      width: target.offsetWidth,
      height: target.offsetHeight,
    });
    return () => applyStyles(target, styles);
  }
}
