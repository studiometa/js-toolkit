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
    this.unbindOpen = this.$children.AccordionItem.map((item, index) => {
      return item.$on('open', () => {
        if (this.$options.autoclose) {
          this.$children.AccordionItem.filter((el, i) => index !== i).forEach(it => it.close());
        }
      });
    });
  }

  /**
   * Destroy autoclose behavior on destroyed.
   * @return {void}
   */
  destroyed() {
    this.unbindOpen.forEach(unbind => unbind());
  }
}
