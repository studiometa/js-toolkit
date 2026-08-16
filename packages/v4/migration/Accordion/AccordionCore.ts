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
    open: { item: AccordionItem; index: number };
    close: { item: AccordionItem; index: number };
  };
}

/** Coordinates a live, DOM-ordered group of `AccordionItem` children. */
export class AccordionCore extends Base<AccordionProps> {
  static config: BaseConfig = {
    name: 'Accordion',
    options: {
      autoclose: Boolean,
      item: { type: Object, default: () => ({}) },
    },
  };

  items: ChildrenCollection<AccordionItem> = this.$watchChildren<AccordionItem>('AccordionItem');

  onAccordionItemOpen({ target }: DelegatedEvent<AccordionItem>): void {
    this.$emit('open', { item: target, index: this.items.items.indexOf(target) });

    if (this.$options.autoclose) {
      for (const item of this.items) {
        if (item !== target) {
          void item.close();
        }
      }
    }
  }

  onAccordionItemClose({ target }: DelegatedEvent<AccordionItem>): void {
    this.$emit('close', { item: target, index: this.items.items.indexOf(target) });
  }
}
