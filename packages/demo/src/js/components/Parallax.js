import { Base, withScrolledInView } from '@studiometa/js-toolkit';
import { map } from '@studiometa/js-toolkit/utils';

export default class Parallax extends withScrolledInView(Base) {
  static config = {
    name: 'Parallax',
    refs: ['target'],
    options: {
      speed: Number,
    },
  };

  scrolledInView({ progress }) {
    const y = map(progress, 0, 1, 100, -100) * this.$options.speed;
    this.$refs.target.style.transform = `translateY(${y}px)`;
  }
}
