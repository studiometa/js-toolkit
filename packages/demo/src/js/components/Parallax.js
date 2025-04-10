import { Base, withScrolledInView, withFreezedOptions } from '@studiometa/js-toolkit';
import { map, transform } from '@studiometa/js-toolkit/utils';

/**
 *
 */
export default class Parallax extends withScrolledInView(withFreezedOptions(Base)) {
  static config = {
    name: 'Parallax',
    refs: ['target'],
    options: {
      speed: Number,
    },
  };

  /**
   *
   */
  scrolledInView(props) {
    const { target } = this.$refs;
    const y = map(props.dampedProgress.y, 0, 1, 100, -100) * this.$options.speed;
    const scale = map(props.dampedProgress.x, 0, 1, 0.5, 2);
    return () => transform(target, { y, scale });
  }
}
