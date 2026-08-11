import {
  Base,
  children,
  on,
  write,
  type ChildrenCollection,
  type DelegatedEvent,
} from '../../src/index.js';

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
export class AccordionItem extends Base<{
  // The component only makes sense on a <details>, so `open` is reachable
  // straight off `$el` — no getter, no cast.
  $el: HTMLDetailsElement;
  $emits: { open: []; close: [] };
}> {
  static config = { name: 'AccordionItem' };

  get isOpen(): boolean {
    return this.$el.open;
  }

  // The bodies are DOM writes: @write runs them in the scheduler's write
  // phase, so several items closing in the same turn paint in one frame.
  @write
  open(): void {
    this.$el.open = true;
  }

  @write
  close(): void {
    this.$el.open = false;
  }

  // Native `toggle` fires on the <details> element itself (it does not
  // bubble) — own handlers bind directly on the root element, so this works.
  onToggle(): void {
    this.$emit(this.$el.open ? 'open' : 'close');
  }
}

export class Accordion extends Base<{
  $options: { autoclose: boolean };
}> {
  static config = {
    name: 'Accordion',
    components: { AccordionItem },
    options: { autoclose: Boolean },
  };

  @children<AccordionItem>('AccordionItem')
  accessor items!: ChildrenCollection<AccordionItem>;

  // `open` bubbles from any depth; one delegated listener, no rebinding.
  // The explicit @on pair frees the method name and needs no name parsing —
  // the magic `onAccordionItemOpen()` form remains the no-build equivalent.
  @on('AccordionItem', 'open')
  autoclose({ target }: DelegatedEvent<AccordionItem>): void {
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
