/* eslint-disable max-classes-per-file */
import { Base } from '../../../src';

class AccordionItem extends Base {
  get config() {
    return {
      name: 'AccordionItem',
    };
  }

  mounted() {
    this.$refs.button.setAttribute('id', this.$id);
    this.$refs.button.addEventListener('click', this);
    this.$refs.content.setAttribute('aria-labelledby', this.$id);

    if (!this.isOpen) {
      this.close();
    }
  }

  destroyed() {
    this.$el.removeEventListener('click', this);
  }

  handleEvent(event) {
    try {
      this[`${event.type}Handler`](event);
    } catch (err) {
      console.warn(`The method \`${event.type}Handler\` does not exists.`);
    }
  }

  clickHandler() {
    this.$log('clickHandler');
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.$emit('open');
    this.$refs.content.setAttribute('aria-hidden', 'false');
    this.$refs.content.removeAttribute('tabindex');

    this.$refs.content.style.display = 'block';

    this.$el.classList.remove('is-close');
    this.$el.classList.add('is-open');
  }

  close() {
    this.$emit('close');
    this.$refs.content.setAttribute('aria-hidden', 'true');
    this.$refs.content.setAttribute('tabindex', '0');

    this.$refs.content.style.display = 'none';

    this.$el.classList.remove('is-open');
    this.$el.classList.add('is-close');
  }

  get isOpen() {
    return (
      this.$refs.content.getAttribute('aria-hidden') === 'false' ||
      this.$refs.content.getAttribute('aria-hidden') === null
    );
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
    if (typeof this.$el.dataset.optionsItemAutoClose === 'undefined') {
      return;
    }

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
