import type { BaseConfig } from '../../src/index.js';
import { AccordionCore } from './AccordionCore.js';
import { AccordionItem } from './AccordionItem.js';

/**
 * Accordion — the ready-to-use component.
 *
 * Unchanged from v3 apart from the config spread: v4 merges configs along the
 * prototype chain, so `components` is all this class has to declare. In v3 it
 * had to spread `AccordionCore.config` by hand or lose the parent's options
 * (issue #627).
 */
export class Accordion extends AccordionCore {
  static config: BaseConfig = {
    name: 'Accordion',
    components: { AccordionItem },
  };
}
