import { Base } from '../../../../src';

export default class Skew extends Base {
  get config() {
    return {
      name: 'Skew',
    };
  }

  mounted() {
    this.isVisible = false;
    this.observer = new IntersectionObserver(([entry]) => {
      this.isVisible = entry.intersectionRatio > 0;
    });

    this.observer.observe(this.$el);
  }

  destroyed() {
    this.observer.disconnect();
  }

  scrolled({ delta }) {
    if (!this.isVisible) {
      return;
    }

    const skewY = delta.y * -0.05;
    this.$el.style.transform = `skewY(${skewY}deg)`;
  }
}
