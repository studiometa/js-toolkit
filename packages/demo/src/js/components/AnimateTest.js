import { Base } from '@studiometa/js-toolkit';
import { animate } from '@studiometa/js-toolkit/utils';

/**
 * AnimateTest class.
 */
export default class AnimateTest extends Base {
  /**
   * Config.
   */
  static config = {
    name: 'AnimateTest',
    refs: ['target', 'play', 'pause', 'resume', 'stop'],
    debug: true,
    options: {
      steps: Array,
    },
  };

  mounted() {
    this.animate = animate(this.$refs.target, this.$options.steps);
  }

  onPlayClick() {
    console.log('play click');
    this.animate.play();
  }

  onPauseClick() {
    this.animate.pause();
  }

  onResumeClick() {
    this.animate.resume();
  }

  onStopClick() {
    this.animate.stop();
  }
}
