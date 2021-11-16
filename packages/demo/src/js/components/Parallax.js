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
    const y = map(progress.y, 0, 1, 100, -100) * this.$options.speed;
    const scale = map(progress.x, 0, 1, 0.5, 2);
    this.$refs.target.style.transform = `translateY(${y}px) scale(${scale})`;
  }
}
