import Base from '../../../../src';
import { withIntersectionObserver } from '../../../../src/decorators';

export default class Skew extends withIntersectionObserver(Base) {
  static config = {
    name: 'Skew',
  };

  mounted() {
    this.isVisible = false;
  }

  intersected([entry]) {
    this.isVisible = entry.intersectionRatio > 0;
  }

  scrolled({ delta }) {
    if (!this.isVisible) {
      return;
    }

    const skewY = delta.y * -0.05;
    this.$el.style.transform = `skewY(${skewY}deg)`;
  }
}
