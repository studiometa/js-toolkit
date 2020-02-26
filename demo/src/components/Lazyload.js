import { Base } from '../../../dist';

export default class Lazyload extends Base {
  get config() {
    return {
      name: 'Lazyload',
      el: '[data-src]',
    };
  }

  mounted() {
    this.observer = new IntersectionObserver(([entry]) => {
      // If intersectionRatio is 0, the target is out of view
      // and we do not need to do anything.
      if (entry.intersectionRatio <= 0) {
        return;
      }

      const src = this.$el.getAttribute('data-src');
      const img = new Image();
      img.onload = () => {
        this.$el.setAttribute('src', src);
        this.$el.classList.add('is-loaded');
        this.$el.removeAttribute('data-src');
      };
      img.src = src;
      this.observer.unobserve(this.$el);
    });

    this.observer.observe(this.$el);
  }
}
