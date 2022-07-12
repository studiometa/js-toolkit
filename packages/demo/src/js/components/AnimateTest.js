import { Base } from '@studiometa/js-toolkit';
import { animate, ease, domScheduler } from '@studiometa/js-toolkit/utils';

/**
 * AnimateTest class.
 */
export default class AnimateTest extends Base {
  /**
   * Config.
   */
  static config = {
    name: 'AnimateTest',
    refs: ['target', 'start', 'pause', 'play', 'finish', 'progress'],
    options: {
      steps: Array,
      duration: {
        type: Number,
        default: 2,
      },
      easing: String,
    },
  };

  mounted() {
    this.animate = animate(
      this.$refs.target,
      this.$options.steps.map((step) => {
        if (typeof step.easing === 'string') {
          step.easing = ease[step.easing];
        }

        return step;
      }),
      {
        duration: this.$options.duration,
        easing: ease[this.$options.easing],
        onProgress: (progress) => {
          domScheduler.write(() => {
            this.$refs.progress.value = progress;
          });
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

  onFinishClick() {
    this.animate.finish();
  }

  onProgressInput() {
    this.animate.progress(this.$refs.progress.valueAsNumber);
  }
}
