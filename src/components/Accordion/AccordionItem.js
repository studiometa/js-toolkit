import Base from '../../abstracts/Base';
import * as classes from '../../utils/css/classes';
import transition from '../../utils/css/transition';

/**
 * AccordionItem class.
 */
export default class AccordionItem extends Base {
  /**
   * AccordionItem config
   * @return {Object}
   */
  get config() {
    return {
      name: 'AccordionItem',
      active: '',
      enterActive: '',
      leaveActive: '',
    };
  }

  /**
   * Add aria-attributes on mounted.
   * @return {void}
   */
  mounted() {
    this.$refs.btn.setAttribute('id', this.$id);
    this.$refs.content.setAttribute('aria-labelledby', this.$id);
  }

  /**
   * Handler for the click event on the `btn` ref.
   * @return {void}
   */
  onBtnClick() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open an item.
   * @return {void}
   */
  async open() {
    if (this.isOpen) {
      return;
    }

    this.$log('open');
    this.$emit('open');

    this.isOpen = true;
    this.$refs.container.setAttribute('aria-hidden', 'false');

    classes.remove(this.$refs.container, 'invisible');
    const height = this.$refs.content.offsetHeight;
    await transition(this.$refs.container, {
      from: { height: 0 },
      active: this.$options.enterActive || this.$options.active,
      to: { height: `${height}px` },
    });

    classes.remove(this.$refs.container, 'h-0');
    classes.remove(this.$refs.content, 'absolute');
  }

  /**
   * Close an item.
   * @return {void}
   */
  async close() {
    if (!this.isOpen) {
      return;
    }

    this.$log('close');
    this.$emit('close');

    this.isOpen = false;

    const height = this.$refs.content.offsetHeight;
    classes.add(this.$refs.content, 'absolute');
    await transition(this.$refs.container, {
      from: { height: `${height}px` },
      active: this.$options.leaveActive || this.$options.active,
      to: 'h-0',
    });
    classes.add(this.$refs.container, 'h-0');
    classes.add(this.$refs.container, 'invisible');
    this.$refs.container.setAttribute('aria-hidden', 'true');
  }
}
