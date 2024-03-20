import { animate, ease } from '@studiometa/js-toolkit/utils';
import AnimateTest from './AnimateTest.js';

/**
 * AnimateTest class.
 */
export default class AnimateTestMultiple extends AnimateTest {
  /**
   * Config.
   */
  static config = {
    ...AnimateTest.config,
    name: 'AnimateTestMultiple',
    refs: ['targets[]', 'start', 'pause', 'play', 'finish', 'progress'],
    options: {
      stagger: Number,
    },
  };

  mounted() {
    const steps = this.$options.steps.map((step) => {
      if (typeof step.easing === 'string') {
        step.easing = ease[step.easing];
      }

      return step;
    });

    const options = {
      smooth: this.$options.smooth,
      stagger: this.$options.stagger,
      duration: this.$options.duration,
      easing: ease[this.$options.easing],
    };

    console.log(options);

    this.animate = animate(this.$refs.targets, steps, {
      ...options,
      // onProgress: (progress) => {
      //   this.$refs.progress.value = progress;
      // },
    });
    this.animate.progress(this.$refs.progress.valueAsNumber);
  }
}
