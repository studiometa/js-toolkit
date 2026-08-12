import { Base, scheduler, type BaseConfig } from '../../src/index.js';
import { applyStyles, compile, type Keyframe, type KeyframeStyles } from '../utils/keyframes.js';
import { clamp01, map } from '../utils/math.js';
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

/**
 * AbstractScrollAnimation — shared base for the scroll-linked animations.
 *
 * Port of @studiometa/ui 1.10's `AbstractScrollAnimation`. Same options, same
 * `playRange` arithmetic, same mapping of the damped progress onto the
 * animation.
 *
 * The one structural change is what drives the styles. v3 builds a full
 * `animate()` player — a tween, a rAF loop, a per-element registry of running
 * animations, `start` / `pause` / `play` / `finish` — and then never plays it:
 * it only ever calls `animation.progress(p)`. v4 compiles the same keyframes
 * into a pure `(progress, size) => styles` function, and `scrolledInView()`
 * hands the resulting write back to the scheduler.
 *
 * `withFreezedOptions` is not ported: it existed because v3 re-read and
 * re-parsed `data-option-*` attributes on every access, which was expensive
 * inside a per-frame handler. v4 keeps the same live-getter semantics, so the
 * decorator would still buy something for `Object`/`Array` options — noted in
 * the report rather than worked around.
 */
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

  /**
   * Start and end of the play range.
   *
   * The three-value form `[index, length, step]` splits the range into
   * `length` staggered slices — unchanged from v3.
   */
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
    // Restore the animation state for the current progress.
    this.renderNow(this.progress);
  }

  destroyed(): void {
    // Complete the animation to its nearest boundary.
    this.renderNow(Math.round(this.progress));
  }

  /**
   * Render outside a `scrolledInView()` pass. Measuring stays in `read` and
   * writing in `write`, and neither is instance-owned: `$destroy()` cancels
   * the instance's pending tasks straight after the cleanups, which would
   * drop the boundary render this schedules.
   */
  renderNow(progress: number): void {
    scheduler.read(() => scheduler.write(this.render(progress)));
  }

  scrolledInView({ dampedProgressY }: ScrollInViewProps): ScrolledInViewRender {
    const [start, end] = this.playRange;
    return this.render(clamp01(map(dampedProgressY, start, end, 0, 1)));
  }

  /**
   * Compute the styles for a progress value and hand back the write.
   *
   * Splitting compute from write is what lets a whole timeline measure once
   * and mutate once: v3's `animate` nested a `domScheduler.read` inside a
   * `domScheduler.write` per element instead.
   */
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
