import { Base, type ChildrenCollection } from '../../src/index.js';
import { Transition, type Transitionable } from '../Transition/Transition.js';
import { ViewTransition } from '../Transition/ViewTransition.js';
import { saveActiveElement, trapFocus, untrapFocus } from '../utils/focus.js';

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
export class Dialog extends Base<DialogProps> {
  static config = {
    name: 'Dialog',
    components: { Transition, ViewTransition },
    options: {
      modal: { type: Boolean, default: true },
      trapFocus: { type: Boolean, default: true },
      scrollLock: { type: Boolean, default: true },
    },
  };

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

  mounted() {
    const onKeydown = (event: KeyboardEvent) => {
      if (this.$options.modal || !this.$options.trapFocus || !this.$el.open) {
        return;
      }
      trapFocus(this.$el, event);
    };
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }

  /** Route native cancellation through `close()` so cleanup and transitions run. */
  onCancel(event: Event): void {
    event.preventDefault();
    this.close();
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
      document.documentElement.style.overflow = 'hidden';
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

    if (this.$options.scrollLock) {
      document.documentElement.style.overflow = '';
    }
  }

  toggle(): Promise<void> {
    return this.$el.open ? this.close() : this.open();
  }
}
