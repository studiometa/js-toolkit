import { Base } from '@studiometa/js-toolkit';
import { animate, ease } from '@studiometa/js-toolkit/utils';

/**
 * AnimateTest class.
 */
export default class AnimateTest extends Base {
  /**
   * Config.
   */
  static config = {
    name: 'AnimateTest',
    refs: ['target', 'start', 'pause', 'play', 'stop', 'progress'],
    options: {
      steps: Array,
      duration: {
        type: Number,
        default: 2,
      },
      ease: String,
    },
  };

  mounted() {
    this.animate = animate(
      this.$refs.target,
      this.$options.steps.map((step) => {
        if (step.ease) {
          step.ease = ease[step.ease];
        }

        return step;
      }),
      {
        duration: this.$options.duration,
        ease: ease[this.$options.ease],
        onProgress: (progress) => {
          this.$refs.progress.value = progress;
        },
      }
    );

    this.animate.progress(0.45);
  }

  onStartClick() {
    this.animate.start();
  }

  onPauseClick() {
    this.animate.pause();
  }

  onPlayClick() {
    this.animate.play();
  }

  onStopClick() {
    this.animate.stop();
  }

  onProgressInput() {
    this.animate.progress(this.$refs.progress.valueAsNumber);
  }
}
