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
    refs: ['target', 'start', 'pause', 'play', 'stop', 'progress', 'easedProgress'],
    debug: true,
    options: {
      steps: Array,
      duration: {
        type: Number,
        default: 2,
      },
    },
  };

  mounted() {
    this.reverseAnimate = animate(
      this.$refs.target,
      this.$options.steps.map((step) => [1 - step[0], step[1]]).reverse(),
      {
        duration: this.$options.duration,
        ease: ease.easeInOutExpo,
        onProgress: (progress, easedProgress) => {
          this.$refs.progress.value = 1 - progress;
          this.$refs.easedProgress.value = 1 - easedProgress;
        },
        onStop: () => {
          this.animate.start();
        },
      }
    );

    this.animate = animate(this.$refs.target, this.$options.steps, {
      duration: this.$options.duration,
      ease: ease.easeInOutExpo,
      onProgress: (progress, easedProgress) => {
        this.$refs.progress.value = progress;
        this.$refs.easedProgress.value = easedProgress;
      },
      onStop: () => {
        this.reverseAnimate.start();
      },
    });
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
