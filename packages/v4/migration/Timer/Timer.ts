import { Base, type BaseConfig, type BaseProps, type MountedReturn } from '../../src/index.js';

export type TimerProps = BaseProps & {
  $options: {
    delay: number;
    repeat: boolean;
    autostart: boolean;
  };
  $emits: {
    'timer-start': void;
    'timer-end': void;
    'timer-tick': void;
    'timer-pause': void;
    'timer-resume': void;
    'timer-stop': void;
  };
};

/**
 * A headless, composable countdown primitive. It emits bubbling events for
 * its lifecycle and exposes imperative methods, holding no UI state of its
 * own — combine it with `Action` (to react to `timer-*` events or call its
 * methods) and the `Data*` family (to turn those events into reactive
 * state).
 *
 * The timing fields below are regular fields rather than `#private`: v3
 * declared them `@protected` because `TimerProgress` reads them directly,
 * and a JS private field is invisible to a subclass entirely, not merely
 * hidden from the outside — there is no v4 equivalent of "protected".
 *
 * @link https://ui.studiometa.dev/reference/items/Timer/
 */
export class Timer<T extends BaseProps = BaseProps> extends Base<TimerProps & T> {
  static config: BaseConfig = {
    name: 'Timer',
    options: {
      delay: { type: Number, default: 0 },
      repeat: Boolean,
      autostart: { type: Boolean, default: true },
    },
  };

  /** The pending `setTimeout` id, or `null` when idle. */
  timerId: number | null = null;

  /** Timestamp (ms) at which the current countdown segment was armed. */
  armedAt = 0;

  /** Time (ms) already consumed before the current segment, preserved across pauses. */
  elapsed = 0;

  /** Time (ms) left to wait before the countdown completes. */
  remaining = 0;

  /** Whether a countdown is currently paused and can be resumed. */
  paused = false;

  /** The total countdown duration in milliseconds (the `delay` option is in seconds). */
  get duration(): number {
    return this.$options.delay * 1000;
  }

  /** Start the countdown on mount unless `autostart` is disabled, cancel it on destroy. */
  mounted(): MountedReturn {
    if (this.$options.autostart) {
      this.start();
    }
    return () => this.clear();
  }

  /** Start — or restart — the countdown from the beginning. */
  start(): void {
    this.clear();
    this.paused = false;
    this.elapsed = 0;
    this.remaining = this.duration;
    this.$emit('timer-start');
    this.arm(this.remaining);
  }

  /** Alias for `start()`, restarting the countdown from zero. */
  restart(): void {
    this.start();
  }

  /** Stop the countdown without completing it. */
  stop(): void {
    this.clear();
    this.paused = false;
    this.remaining = 0;
    this.$emit('timer-stop');
  }

  /** Pause the countdown, preserving the remaining time. */
  pause(): void {
    if (this.timerId === null) {
      return;
    }

    const consumed = performance.now() - this.armedAt;
    this.elapsed += consumed;
    this.remaining -= consumed;
    this.clear();
    this.paused = true;
    this.$emit('timer-pause');
  }

  /** Resume a paused countdown from where it left off. */
  resume(): void {
    if (!this.paused) {
      return;
    }

    this.paused = false;
    this.$emit('timer-resume');
    this.arm(this.remaining);
  }

  /** Arm the countdown for the given duration in milliseconds. */
  arm(delay: number): void {
    this.armedAt = performance.now();
    this.timerId = window.setTimeout(() => this.complete(), delay);
  }

  /** Handle the countdown reaching zero, re-arming when `repeat` is enabled. */
  complete(): void {
    this.timerId = null;
    this.$emit('timer-end');

    if (this.$options.repeat) {
      this.$emit('timer-tick');
      this.start();
    }
  }

  /** Cancel any pending countdown. Subclasses extend this to release extra resources. */
  clear(): void {
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
    }

    this.timerId = null;
  }
}
