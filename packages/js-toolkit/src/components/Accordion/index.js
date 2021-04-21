import Base from '../../abstracts/Base';
// eslint-disable-next-line import/no-cycle
import AccordionItem from './AccordionItem';

/**
 * @typedef {Object} AccordionRefs
 * @property {HTMLElement[]} btn
 * @property {HTMLElement[]} content
 */

/**
 * @typedef {Object} AccordionOptions
 * @property {Boolean} autoclose
 * @property {Object} item
 */

/**
 * @typedef {Object} AccordionChildren
 * @property {AccordionItem[]} AccordionItem
 */

/**
 * @typedef {Object} AccordionInterface
 * @property {AccordionOptions} $options
 * @property {AccordionRefs} $refs
 * @property {AccordionChildren} $children
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
      item: Object,
    },
    components: {
      AccordionItem,
    },
  };

  /**
   * @type {Array<Function>}
   */
  unbindMethods = [];

  /**
   * Init autoclose behavior on mounted.
   * @this {Accordion & AccordionInterface}
   * @return {Promise<void>}
   */
  async mounted() {
    this.unbindMethods = this.$children.AccordionItem.map((item, index) => {
      if (item instanceof Promise) {
        throw new Error('The AccordionItem component can not be used asynchronously.');
      }

      const unbindOpen = item.$on('open', () => {
        this.$emit('open', item, index);
        if (this.$options.autoclose) {
          // @ts-ignore
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
