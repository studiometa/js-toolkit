import AccordionCore from './Accordion.js';
import AccordionItem from './AccordionItem.js';

/**
 * @typedef {import('./Accordion.js').AccordionInterface} AccordionInterface
 * @typedef {import('./AccordionItem.js').AccordionItemInterface} AccordionItemInterface
 */

/**
 * Accordion class.
 */
class Accordion extends AccordionCore {
  static config = {
    ...AccordionCore.config,
    components: {
      AccordionItem,
    },
  };
}

export default Accordion;
