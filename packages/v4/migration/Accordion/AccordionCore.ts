import {
  Base,
  type BaseConfig,
  type ChildrenCollection,
  type DelegatedEvent,
} from '../../src/index.js';
import type { AccordionItem } from './AccordionItem.js';

export interface AccordionProps {
  $options: { autoclose: boolean; item: Record<string, unknown> };
  $emits: {
    open: [item: AccordionItem, index: number];
    close: [item: AccordionItem, index: number];
  };
}

/**
 * AccordionCore — the orchestrator for a group of `AccordionItem` children.
 *
 * Port of @studiometa/ui 1.10's `AccordionCore`. Everything it does is
 * cross-item coordination, which is exactly the `$children` coordinator shape
 * v4 replaces:
 *
 * - `$children.AccordionItem` → `$watchChildren('AccordionItem')`, a live
 *   DOM-ordered collection that is correct whatever the mount order.
 * - `onAccordionItemOpen({ index })` → a delegated handler carrying the
 *   emitting instance itself, so the index is only needed to keep the v3
 *   event payload.
 * - `config.emits: ['open', 'close']` → the type-only `$emits` declaration.
 */
export class AccordionCore extends Base<AccordionProps> {
  static config: BaseConfig = {
    name: 'Accordion',
    options: {
      autoclose: Boolean,
      item: { type: Object, default: {} },
    },
  };

  items: ChildrenCollection<AccordionItem> = this.$watchChildren<AccordionItem>('AccordionItem');

  onAccordionItemOpen({ target }: DelegatedEvent<AccordionItem>): void {
    this.$emit('open', target, this.items.items.indexOf(target));

    if (this.$options.autoclose) {
      for (const item of this.items) {
        if (item !== target) {
          item.close();
        }
      }
    }
  }

  onAccordionItemClose({ target }: DelegatedEvent<AccordionItem>): void {
    this.$emit('close', target, this.items.items.indexOf(target));
  }
}
