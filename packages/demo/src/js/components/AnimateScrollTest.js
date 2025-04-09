import { withScrolledInView } from '@studiometa/js-toolkit';
import AnimateTest from './AnimateTest.js';

/**
 *
 */
export default class AnimateScrollTest extends withScrolledInView(AnimateTest) {
  static config = {
    name: 'AnimateScrollTest',
  };

  /**
   *
   */
  scrolledInView(props) {
    this.animate.progress(props.dampedProgress.y);
  }
}
