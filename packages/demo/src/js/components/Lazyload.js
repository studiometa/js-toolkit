import Base from '@studiometa/js-toolkit';
import { withIntersectionObserver } from '@studiometa/js-toolkit/decorators';
import transition, { setClassesOrStyles } from '@studiometa/js-toolkit/utils/css/transition';

export default class Lazyload extends withIntersectionObserver(Base) {
  static config = {
    name: 'Lazyload',
    log: true,
    options: {
      styles: {
        type: Object,
        default: () => ({
          unloaded: { opacity: 0 },
          active: { transition: 'opacity 0.5s' },
          loaded: '',
        }),
      },
    },
  };

  mounted() {
    setClassesOrStyles(this.$el, this.$options.styles.unloaded);
  }

  intersected([entry]) {
    if (entry.isIntersecting) {
      window.requestIdleCallback(this.load);
    }
  }

  load() {
    const { unloaded, active, loaded } = this.$options.styles;
    const src = this.$el.getAttribute('data-src');

    if (!src || this.isLoaded) {
      this.$destroy();
      return;
    }

    const img = new Image();
    img.onload = () => {
      this.$el.setAttribute('src', src);
      this.$el.removeAttribute('data-src');
      this.isLoaded = true;
      transition(this.$el, {
        from: unloaded,
        active,
        to: loaded,
      });
      setClassesOrStyles(this.$el, loaded);
      this.$terminate();
    };
    img.src = src;
  }
}
