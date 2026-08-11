import { Base, type DelegatedEvent } from '../../src/index';

/**
 * Reimplementation of @studiometa/ui's Accordion on the v4 model.
 *
 * The markup is native `<details>`/`<summary>`: everything works without
 * JavaScript. The components only add cross-item coordination (autoclose)
 * — the v4 principle "what the browser does natively, we do not reimplement".
 *
 * v3 → v4 changes:
 * - No parent-constructed children: each `<details>` mounts on its own.
 * - No option forwarding through `$parent`: the parent reacts to bubbling
 *   `open` events through delegation (`onAccordionItemOpen`).
 * - `$watchChildren` replaces `$children.AccordionItem`.
 */
export class AccordionItem extends Base {
  static config = { name: 'AccordionItem' };

  get details(): HTMLDetailsElement {
    return this.$el as HTMLDetailsElement;
  }

  get isOpen(): boolean {
    return this.details.open;
  }

  open(): void {
    this.$write(() => {
      this.details.open = true;
    });
  }

  close(): void {
    this.$write(() => {
      this.details.open = false;
    });
  }

  // Native `toggle` fires on the <details> element itself (it does not
  // bubble) — own handlers bind directly on the root element, so this works.
  onToggle(): void {
    this.$emit(this.details.open ? 'open' : 'close');
  }
}

export class Accordion extends Base {
  static config = {
    name: 'Accordion',
    components: { AccordionItem },
    options: { autoclose: Boolean },
  };

  items = this.$watchChildren<AccordionItem>('AccordionItem');

  // `open` bubbles from any depth; one delegated listener, no rebinding.
  onAccordionItemOpen({ target }: DelegatedEvent<AccordionItem>): void {
    if (!this.$options.autoclose) {
      return;
    }
    for (const item of this.items) {
      if (item !== target && item.isOpen) {
        item.close();
      }
    }
  }
}
