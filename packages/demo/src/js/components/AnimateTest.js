import { Base } from '@studiometa/js-toolkit';
import { animate, ease, domScheduler } from '@studiometa/js-toolkit/utils';

/**
 * AnimateTest class.
 * @typedef {{
 *   target: HTMLElement,
 *   start: HTMLButtonElement,
 *   pause: HTMLButtonElement,
 *   play: HTMLButtonElement,
 *   finish: HTMLButtonElement,
 *   progress: HTMLInputElement,
 * }} AnimateTestRefs
 * @typedef {{
 *   steps: Parameters<animate>[1],
 *   duration: number,
 *   easing: string,
 * }} AnimateTestOptions
 * @augments {Base<{ $refs: AnimateTestRefs, $options: AnimateTestOptions }>}
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
      smooth: {
        type: Number,
        default: false,
      },
      spring: {
        type: Number,
        default: false,
      },
      duration: {
        type: Number,
        default: 2,
      },
      easing: String,
    },
  };

  /**
   *
   */
  get $options() {
    const { smooth, ...options } = super.$options;

    if (smooth === 0) {
      return options;
    }

    return super.$options;
  }

  /**
   *
   */
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
        smooth: this.$options.smooth,
        spring: this.$options.spring,
        easing: ease[this.$options.easing],
        onProgress: (progress) => {
          domScheduler.write(() => {
            this.$refs.progress.value = progress;
          });
        },
      },
    );

    this.$refs.progress.value = 0.5;
    this.animate.progress(this.$refs.progress.valueAsNumber);
  }

  /**
   *
   */
  onStartClick() {
    console.log(this.animate);
    this.animate.start();
  }

  /**
   *
   */
  onPauseClick() {
    this.animate.pause();
  }

  /**
   *
   */
  onPlayClick() {
    this.animate.play();
  }

  /**
   *
   */
  onFinishClick() {
    this.animate.finish();
  }

  /**
   *
   */
  onProgressInput() {
    console.log('onProgressInput');
    this.animate.progress(this.$refs.progress.valueAsNumber);
  }
}
