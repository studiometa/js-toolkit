import { Base, withScrolledInView } from '@studiometa/js-toolkit';
import { map } from '@studiometa/js-toolkit/utils';
import stylefire from 'stylefire';

export default class Parallax extends withScrolledInView(Base) {
  static config = {
    name: 'Parallax',
    refs: ['target'],
    options: {
      speed: Number,
    },
  };

  /**
   * @type {import('stylefire').Styler}
   */
  styler;

  mounted() {
    super.mounted();
    this.styler = stylefire(this.$refs.target);
  }

  get freezedOptions() {
    const options = this.$options;
    Object.defineProperty(this, 'freezeOptions', {
      value: Object.freeze(options),
      configurable: true,
    });

    return options;
  }

  scrolledInView(props) {
    this.styler.set({
      y: map(props.progress.y, 0, 1, 100, -100) * this.freezedOptions.speed,
      scale: map(props.progress.x, 0, 1, 0.5, 2),
    });
  }
}
