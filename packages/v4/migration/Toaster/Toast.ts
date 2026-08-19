import { viewTransition, type BaseConfig } from '../../src/index.js';
import { Timer, type TimerProps } from '../Timer/index.js';

export type ToastProps = TimerProps & {
  $refs: { close: HTMLElement };
  $emits: TimerProps['$emits'] & {
    dismiss: { el: HTMLElement };
  };
};

/**
 * A single, self-contained toast built on the `Timer` primitive: `Timer`
 * provides the pausable auto-dismiss countdown (its `delay` option is the
 * toast lifetime, in seconds), `autostart` begins it on mount and its
 * `mounted()` cleanup clears it for free. This class adds the interaction —
 * pausing while hovered or focused, an optional close control — and
 * animates itself out through the shared `viewTransition` scheduler when
 * dismissed.
 *
 * It is mounted automatically when a `Toaster` inserts it, and destroyed
 * automatically when it removes itself — so a `Toaster` never has to track
 * or tear down individual toasts.
 *
 * @link https://ui.studiometa.dev/reference/items/Toaster/
 */
export class Toast<T extends TimerProps = TimerProps> extends Timer<T & ToastProps> {
  /** Merges with `Timer`'s (the `delay`/`autostart`/`repeat` options are inherited). */
  static config: BaseConfig = {
    name: 'Toast',
    refs: ['close'],
  };

  /** Whether the toast is already leaving, so a click + timer race dismisses once. */
  #dismissed = false;

  /** Pause the countdown while the pointer is over the toast. */
  onMouseenter(): void {
    this.pause();
  }

  /** Resume the countdown when the pointer leaves. */
  onMouseleave(): void {
    this.resume();
  }

  /**
   * Pause while the focus is anywhere inside the toast (`focusin`/`focusout`
   * bubble, unlike `focus`/`blur`, so this covers the close control too).
   */
  onFocusin(): void {
    this.pause();
  }

  /** Resume when the focus leaves the toast. */
  onFocusout(): void {
    this.resume();
  }

  /** Dismiss when the close control is activated. */
  onCloseClick(): void {
    this.dismiss();
  }

  /** Dismiss the toast once the countdown reaches zero. */
  complete(): void {
    super.complete();
    this.dismiss();
  }

  /**
   * Animate the toast out and remove it from the DOM; the registry then
   * destroys this component (and `Timer`'s `mounted()` cleanup clears any
   * pending countdown).
   */
  dismiss(): void {
    if (this.#dismissed) {
      return;
    }

    this.#dismissed = true;
    this.clear();
    this.$emit('dismiss', { el: this.$el });
    void viewTransition(() => this.$el.remove());
  }
}
