import { Base, withKey, type ChildrenCollection, type KeyProps } from '../../src/index.js';
import { Transition, type Transitionable } from '../Transition/Transition.js';
import { ViewTransition } from '../Transition/ViewTransition.js';
import { saveActiveElement, trapFocus, untrapFocus } from '../../src/utils/focus.js';
import { lockScroll } from '../../src/utils/scroll-lock.js';

export interface DialogProps {
  $el: HTMLDialogElement;
  $options: {
    /**
     * Open as a modal (`showModal()`) or not (`show()`). A modal dialog gets
     * a native focus trap, background `inert` and focus restore for free.
     */
    modal: boolean;
    /** Trap the focus by hand — only meaningful on the non-modal path. */
    trapFocus: boolean;
    /** Lock the document scroll while open. */
    scrollLock: boolean;
  };
  $emits: { open: void; close: void };
}

/**
 * Headless native dialog with optional modality, focus trapping, scroll lock,
 * and child transitions.
 */
export class Dialog extends withKey(Base)<DialogProps> {
  static config = {
    name: 'Dialog',
    components: { Transition, ViewTransition },
    options: {
      modal: { type: Boolean, default: true },
      trapFocus: { type: Boolean, default: true },
      scrollLock: { type: Boolean, default: true },
    },
  };

  /**
   * Releases this dialog's hold on the page scroll.
   *
   * A field rather than a style write, because the page scroll is shared: a
   * dialog opened from inside a drawer must not put the scroll back when it
   * closes while the drawer is still open. It is released on close and again
   * on destroy — the release is idempotent, and a dialog destroyed while open
   * used to leak its lock for the life of the page.
   */
  #releaseScroll: (() => void) | null = null;

  transitionChildren: ChildrenCollection<Transition> =
    this.$watchChildren<Transition>('Transition');

  viewTransitionChildren: ChildrenCollection<ViewTransition> =
    this.$watchChildren<ViewTransition>('ViewTransition');

  get transitions(): Transitionable[] {
    return [...this.transitionChildren.items, ...this.viewTransitionChildren.items];
  }

  get isOpen(): boolean {
    return this.$el.open;
  }

  /** Trap the tabulation by hand; a modal dialog gets the trap natively. */
  keyed({ event, isDown }: KeyProps): void {
    if (!event || !isDown || this.$options.modal || !this.$options.trapFocus || !this.$el.open) {
      return;
    }
    trapFocus(this.$el, event);
  }

  /** Route native cancellation through `close()` so cleanup and transitions run. */
  onCancel(event: Event): void {
    event.preventDefault();
    void this.close();
  }

  async open(): Promise<void> {
    if (this.$el.open) {
      return;
    }

    if (this.$options.modal) {
      this.$el.showModal();
    } else {
      if (this.$options.trapFocus) {
        saveActiveElement();
      }
      this.$el.show();
    }

    if (this.$options.scrollLock) {
      this.#releaseScroll = lockScroll();
    }

    this.$emit('open');
    await Promise.all(this.transitions.map((transition) => transition.enter()));
  }

  async close(): Promise<void> {
    if (!this.$el.open) {
      return;
    }

    this.$emit('close');
    // Keep the dialog painted until leave transitions finish.
    await Promise.all(this.transitions.map((transition) => transition.leave()));
    this.$el.close();

    if (!this.$options.modal && this.$options.trapFocus) {
      untrapFocus();
    }

    this.#releaseScroll?.();
    this.#releaseScroll = null;
  }

  /** A dialog destroyed while open still owes the page its scroll. */
  destroyed(): void {
    this.#releaseScroll?.();
    this.#releaseScroll = null;
  }

  toggle(): Promise<void> {
    return this.$el.open ? this.close() : this.open();
  }
}
