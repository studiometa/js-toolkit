import { Base, withMountWhenInView, useScroll, useRaf } from '@studiometa/js-toolkit';
import { damp, clamp, transform } from '@studiometa/js-toolkit/utils';

const scroll = useScroll();
const raf = useRaf();

let skewY = 0;
let dampedSkewY = 0;

scroll.add('Skew.js', (props) => {
  skewY = clamp(props.delta.y * -0.005, -0.1, 0.1) * 40;

  if (!raf.has('Skew.js')) {
    raf.add('Skew.js', () => {
      dampedSkewY = damp(skewY, dampedSkewY, 0.1);

      if (dampedSkewY === skewY) {
        raf.remove('Skew.js');
      }
    });
  }
});

/**
 *
 */
export default class Skew extends withMountWhenInView(Base) {
  static config = {
    name: 'Skew',
  };

  /**
   *
   */
  scrolled(props) {
    if (props.changed.y && !this.$services.has('ticked')) {
      this.$services.enable('ticked');
    }
  }

  /**
   *
   */
  ticked() {
    if (dampedSkewY === skewY) {
      this.$services.disable('ticked');
    }

    const { $el } = this;
    return () => transform($el, { skewY: dampedSkewY });
  }
}
