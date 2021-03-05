import Base from '../../../../src';
import { matrix } from '../../../../src/utils/css';
import { damp } from '../../../../src/utils/math';
import { withIntersectionObserver } from '../../../../src/decorators';

function clamp(value, min, max) {
  /* eslint-disable no-nested-ternary */
  return min < max
    ? value < min
      ? min
      : value > max
      ? max
      : value
    : value < max
    ? max
    : value > min
    ? min
    : value;
  /* eslint-enable no-nested-ternary */
}

export default class Skew extends withIntersectionObserver(Base) {
  static config = {
    name: 'Skew',
  };

  skewY = 0;

  dampedSkewY = 0;

  intersected([entry]) {
    if (entry.intersectionRatio > 0) {
      this.$services.enable('scrolled');
      this.$services.enable('ticked');
    } else {
      this.$services.disable('scrolled');
      this.$services.disable('ticked');
    }
  }

  scrolled({ delta }) {
    this.skewY = clamp(delta.y * -0.005, -0.1, 0.1);
  }

  ticked() {
    this.dampedSkewY = damp(this.skewY, this.dampedSkewY, 0.1);
    this.$el.style.transform = matrix({ skewY: this.dampedSkewY });
  }
}
