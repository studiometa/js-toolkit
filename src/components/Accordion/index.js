import Base from '../../abstracts/Base';
/* eslint-disable import/no-cycle */
/** @type {Base} */
import AccordionItem from './AccordionItem';

/**
 * @typedef {import('../../abstracts/Base').BaseOptions} BaseOptions
 * @typedef {import('../../abstracts/Base').BaseChildren} BaseChildren
 */

/**
 * Accordion class.
 * @implements {Base}
 * @property {BaseOptions & { autoclose: Boolean, item: Object|null }} $options
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
   * @return {Promise<void>}
   */
  async mounted() {
    /** @type {AccordionItem[]} */
    const items = await Promise.all(
      this.$children.AccordionItem.map((item) =>
        item instanceof Promise ? item : Promise.resolve(item)
      )
    );

    this.unbindMethods = items.map((item, index) => {
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
