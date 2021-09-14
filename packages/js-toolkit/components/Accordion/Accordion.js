import Base from '../../Base/index.js';

/**
 * @typedef {import('./AccordionItem').default} AccordionItem
 * @typedef {import('./AccordionItem').AccordionItemOptions} AccordionItemOptions
 */

/**
 * @typedef {Object} AccordionRefs
 * @property {HTMLElement[]} btn
 * @property {HTMLElement[]} content
 */

/**
 * @typedef {Object} AccordionOptions
 * @property {Boolean} autoclose
 * @property {AccordionItemOptions} item
 */

/**
 * @typedef {Object} AccordionChildren
 * @property {AccordionItem[]} AccordionItem
 */

/**
 * @typedef {Object} AccordionPrivateInterface
 * @property {AccordionOptions} $options
 * @property {AccordionRefs} $refs
 * @property {AccordionChildren} $children
 */

/**
 * @typedef {Accordion & AccordionPrivateInterface} AccordionInterface
 */

/**
 * Accordion class.
 */
export default class Accordion extends Base {
  /**
   * Accordion config.
   */
  static config = {
    name: 'Accordion',
    options: {
      autoclose: Boolean,
      item: {
        type: Object,
        /**
         * @return {Partial<AccordionItemOptions>}
         */
        default: () => ({}),
      },
    },
  };

  /**
   * @this {AccordionInterface}
   * @param {number} index
   * @return {void}
   */
  onAccordionItemOpen(index) {
    const accordionItem = this.$children.AccordionItem[index];
    this.$emit('open', accordionItem, index);
    if (this.$options.autoclose) {
      this.$children.AccordionItem.filter((el, i) => index !== i).forEach((item) => item.close());
    }
  }

  /**
   * @this {AccordionInterface}
   * @param {number} index
   * @return {void}
   */
  onAccordionItemClose(index) {
    const accordionItem = this.$children.AccordionItem[index];
    this.$emit('close', accordionItem, index);
  }
}
