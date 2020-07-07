/* eslint-disable max-classes-per-file */
import { Base } from '../../../../src';
import * as classes from '../../../../src/utils/css/classes';
import transition from '../../../../src/utils/css/transition';

class AccordionItem extends Base {
  get config() {
    return {
      log: true,
      name: 'AccordionItem',
      active: '',
      enterActive: '',
      leaveActive: '',
    };
  }

  mounted() {
    this.$refs.open.setAttribute('id', this.$id);
    this.$refs.content.setAttribute('aria-labelledby', this.$id);
  }

  onOpenClick() {
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

export default class Accordion extends Base {
  get config() {
    return {
      name: 'Accordion',
      autoclose: true,
      components: {
        AccordionItem,
      },
    };
  }

  mounted() {
    if (!this.$options.autoclose) {
      return;
    }

    this.unbindOpen = this.$children.AccordionItem.map((item, index) => {
      return item.$on('open', () => {
        this.$children.AccordionItem.filter((el, i) => index !== i).forEach(it => it.close());
      });
    });
  }

  destroyed() {
    if (!this.$options.autoclose) {
      return;
    }

    this.unbindOpen.forEach(unbind => unbind());
  }
}
