import { Base } from '../../../dist';

export default class Tabs extends Base {
  get config() {
    return {
      name: 'Tabs',
    };
  }

  mounted() {
    this.items = this.$refs.btn.map((btn, index) => {
      const id = `${this.id}-${index}`;
      const content = this.$refs.content[index];
      btn.setAttribute('id', id);
      content.setAttribute('aria-labelledby', id);

      const clickHandler = () => {
        this.$refs.btn.forEach((el, index) => {
          el.classList.remove('is-active');
          this.$refs.content[index].setAttribute('aria-hidden', 'true');
        });
        btn.classList.add('is-active');
        content.setAttribute('aria-hidden', 'false');
      };

      btn.addEventListener('click', clickHandler);
      return {
        btn,
        content: this.$refs.content[index],
        clickHandler,
      };
    });
  }

  destroyed() {
    this.items.forEach(({ btn, clickHandler }) => {
      btn.removeEventListener('click', clickHandler);
    });
  }
}
