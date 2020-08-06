import { Base } from '../../../../src';
import transition, { setClassesOrStyles } from '../../../../src/utils/css/transition';

export default class Lazyload extends Base {
  get config() {
    return {
      name: 'Lazyload',
      styles: {
        unloaded: { opacity: 0 },
        active: { transition: 'opacity 0.5s' },
        loaded: '',
      },
    };
  }

  mounted() {
    setClassesOrStyles(this.$el, this.$options.styles.unloaded);

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.requestIdleCallback(this.load);
        }
      },
      {
        threshold: 1.0,
      }
    );
  }

  loaded() {
    this.observer.observe(this.$el);
  }

  destroyed() {
    this.observer.disconnect();
  }

  load() {
    const { unloaded, active, loaded } = this.$options.styles;
    const src = this.$el.getAttribute('data-src');
    const img = new Image();
    img.onload = () => {
      this.$el.setAttribute('src', src);
      this.$el.removeAttribute('data-src');
      transition(this.$el, {
        from: unloaded,
        active,
        to: loaded,
      });
      setClassesOrStyles(this.$el, loaded);
      this.$destroy();
    };
    img.src = src;
  }
}
