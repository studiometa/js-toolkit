import { Base, withIntersectionObserver } from '@studiometa/js-toolkit';
import { transition, isString, isArray, addClass, addStyle } from '@studiometa/js-toolkit/utils';

/**
 *
 */
function setClassesOrStyles(element, classesOrStyles) {
  if (isString(classesOrStyles) || isArray(classesOrStyles)) {
    addClass(element, classesOrStyles);
  } else {
    addStyle(element, classesOrStyles);
  }
}

/**
 *
 */
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

  /**
   *
   */
  mounted() {
    setClassesOrStyles(this.$el, this.$options.styles.unloaded);
  }

  /**
   *
   */
  intersected([entry]) {
    if (entry.isIntersecting) {
      this.load();
    }
  }

  /**
   *
   */
  load() {
    const { unloaded, active, loaded } = this.$options.styles;
    const { src } = this.$el.dataset;

    if (!src || this.isLoaded) {
      this.$destroy();
      return;
    }

    const img = new Image();
    img.addEventListener('load', () => {
      this.$el.setAttribute('src', src);
      delete this.$el.dataset.src;
      this.isLoaded = true;
      transition(this.$el, {
        from: unloaded,
        active,
        to: loaded,
      });
      setClassesOrStyles(this.$el, loaded);
      this.$terminate();
    });
    img.src = src;
  }
}
