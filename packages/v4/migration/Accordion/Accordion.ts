import type { BaseConfig } from '../../src/index.js';
import { AccordionCore } from './AccordionCore.js';
import { AccordionItem } from './AccordionItem.js';

/** Ready-to-use accordion with `AccordionItem` children. */
export class Accordion extends AccordionCore {
  static config: BaseConfig = {
    name: 'Accordion',
    components: { AccordionItem },
  };
}
