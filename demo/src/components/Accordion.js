/* eslint-disable max-classes-per-file */
import { Base } from '../../../src';

class AccordionItem extends Base {
  get config() {
    return {
      name: 'AccordionItem',
    };
  }

  mounted() {
    this.$el.addEventListener('focusin', this);
    this.$el.addEventListener('focusout', this);
    this.$refs.title.setAttribute('id', this.id);
    this.$refs.content.setAttribute('aria-labelledby', this.id);
  }

  destroyed() {
    this.$el.removeEventListener('focusin', this);
    this.$el.removeEventListener('focusout', this);
  }

  handleEvent(event) {
    try {
      this[`${event.type}Handler`](event);
    } catch (err) {
      console.warn(`The method \`${event.type}Handler\` does not exists.`);
    }
  }

  focusinHandler() {
    this.$log('focusinHandler');
    this.open();
  }

  focusoutHandler() {
    this.$log('focusoutHandler');
    this.close();
  }

  open() {
    this.$emit('open');
    this.$refs.content.setAttribute('aria-hidden', 'false');
  }

  close() {
    this.$emit('close');
    this.$refs.content.setAttribute('aria-hidden', 'true');
  }

  get isOpen() {
    return this.$refs.content.getAttribute('aria-hidden') === 'false';
  }
}

export default class Accordion extends Base {
  get config() {
    return {
      name: 'Accordion',
      components: {
        AccordionItem,
      },
    };
  }

  mounted() {
    this.unbindOpen = this.$children.AccordionItem.map((item, index) => {
      return item.$on('open', () => {
        this.openHandler(index);
      });
    });
  }

  destroyed() {
    this.unbindOpen.forEach(unbind => unbind());
  }

  openHandler(index) {
    this.$children.AccordionItem.filter((el, i) => index !== i).forEach(item => {
      item.close();
    });
  }
}
