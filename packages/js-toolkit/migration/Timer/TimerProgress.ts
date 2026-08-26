import { withRaf, type BaseConfig, type BaseProps } from '../../src/index.js';
import { Timer, type TimerProps } from './Timer.js';

export type TimerProgressProps = TimerProps & {
  $emits: TimerProps['$emits'] & {
    'timer-progress': { ratio: number };
  };
};

/**
 * A `Timer` that additionally emits a smooth, pause-aware `timer-progress`
 * event on every animation frame, carrying a `0 → 1` ratio in its detail. It
 * is a separate component so the base `Timer` never pays the per-frame
 * cost: mount `TimerProgress` only where a continuous indicator (e.g. a
 * progress bar) is needed.
 *
 * v3 mounted `ticked` on the shared `RafService` unconditionally (any class
 * declaring the method got it) and had to `$services.disable('ticked')` in
 * `mounted()` to neutralize that, since progress must only run while a
 * countdown is armed. `withRaf(Timer, { manual: true })` never auto-starts
 * in the first place — `arm()`/`clear()` own the toggle from there on, and
 * there is nothing left to neutralize.
 *
 * @link https://ui.studiometa.dev/reference/items/Timer/
 */
export class TimerProgress<T extends BaseProps = BaseProps> extends withRaf(Timer, {
  manual: true,
})<TimerProgressProps & T> {
  static config: BaseConfig = {
    name: 'TimerProgress',
  };

  /** Emit the current progress ratio on every animation frame while running. */
  ticked(): void {
    const consumed = this.elapsed + (performance.now() - this.armedAt);
    const ratio = Math.min(1, Math.max(0, consumed / (this.duration || 1)));
    this.$emit('timer-progress', { ratio });
  }

  /** Enable the progress loop alongside the countdown. */
  arm(delay: number): void {
    super.arm(delay);
    this.$services.ticked.start();
  }

  /** Report full progress and stop the loop before the countdown completes. */
  complete(): void {
    this.$services.ticked.stop();
    this.$emit('timer-progress', { ratio: 1 });
    super.complete();
  }

  /** Disable the progress loop together with the countdown. */
  clear(): void {
    super.clear();
    this.$services.ticked.stop();
  }

  /** Stop the countdown and reset the reported progress to zero. */
  stop(): void {
    super.stop();
    this.$emit('timer-progress', { ratio: 0 });
  }
}
