import Base from '../../abstracts/Base';
import AccordionItem from './AccordionItem';

/**
 * Accordion class.
 */
export default class Accordion extends Base {
  /**
   * Accordion config.
   * @return {Object}
   */
  get config() {
    return {
      name: 'Accordion',
      autoclose: true,
      item: null,
      components: {
        AccordionItem,
      },
    };
  }

  /**
   * Init autoclose behavior on mounted.
   * @return {void}
   */
  mounted() {
    this.unbindMethods = this.$children.AccordionItem.map((item, index) => {
      const unbindOpen = item.$on('open', () => {
        this.$emit('open', item, index);
        if (this.$options.autoclose) {
          this.$children.AccordionItem.filter((el, i) => index !== i).forEach(it => it.close());
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
    this.unbindMethods.forEach(unbind => unbind());
  }
}
