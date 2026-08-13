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
 * Dialog — a headless wrapper around the native `<dialog>` element.
 *
 * Port of @studiometa/ui 1.10's `Dialog`. It owns only what the platform does
 * not give for free (modality, scroll lock, an optional focus trap for the
 * non-modal path) and fans `enter()`/`leave()` out to every transition child.
 *
 * Three v4 decisions show up here:
 *
 * - `$children.Transition` / `$children.ViewTransition` → two
 *   `$watchChildren` collections, live and mount-order independent. v3's
 *   `$children` only listed the classes declared in `config.components` of
 *   this exact class; a transition inserted later was invisible until the
 *   next `$update()`.
 * - `keyed()` (KeyService) → a plain `keydown` listener registered in
 *   `mounted()` and released by its returned cleanup. v4 dropped `KeyService`
 *   on the grounds that "a keydown listener needs no service around it", and
 *   this is the component that proves it: the hook cost more than the
 *   listener.
 * - `$el` is typed `HTMLDialogElement`, so `showModal()`, `close()` and
 *   `open` are reachable without the `get dialog()` cast v3 needed.
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

  /**
   * Escape closes a native `<dialog>` behind the component's back: v3 let it
   * happen, so the leave transitions never ran and the scroll stayed locked.
   * Cancelling the native close and going through `close()` fixes both — the
   * bubbling `cancel` event makes this a two-line handler in v4.
   */
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
    // Leave transitions are awaited *before* the native hide, so the dialog
    // is still painted while its children animate out.
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
