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
   * @type {Array<Function>}
   */
  unbindMethods = [];

  /**
   * Init autoclose behavior on mounted.
   * @this {AccordionInterface}
   * @return {Promise<void>}
   */
  async mounted() {
    if (!Array.isArray(this.$children.AccordionItem)) {
      throw new Error('The Accordion component must be used with the AccordionItem component.');
    }

    this.unbindMethods = this.$children.AccordionItem.map((item, index) => {
      if (item instanceof Promise) {
        throw new Error('The AccordionItem component can not be used asynchronously.');
      }

      const unbindOpen = item.$on('open', () => {
        this.$emit('open', item, index);
        if (this.$options.autoclose) {
          this.$children.AccordionItem.filter((el, i) => index !== i).forEach((it) => it.close());
        }
      });
      const unbindClose = item.$on('close', () => {
        this.$emit('close', item, index);
      });

      return () => {
        unbindOpen();
        unbindClose();
      };
    });
  }

  /**
   * Destroy autoclose behavior on destroyed.
   * @return {void}
   */
  destroyed() {
    this.unbindMethods.forEach((unbind) => unbind());
  }
}
