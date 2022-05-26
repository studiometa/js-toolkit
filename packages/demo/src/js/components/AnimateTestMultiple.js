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
  };

  mounted() {
    const steps = this.$options.steps.map((step) => {
      if (typeof step.easing === 'string') {
        step.easing = ease[step.easing];
      }

      return step;
    });

    const options = {
      duration: this.$options.duration,
      easing: ease[this.$options.easing],
    };

    const animations = this.$refs.targets.map((target, index) => {
      return animate(target, steps, {
        ...options,
        onProgress:
          index === 0
            ? (progress) => {
                this.$refs.progress.value = progress;
              }
            : undefined,
      });
    });

    const delegate =
      (action) =>
      (...args) => {
        animations.forEach((animation) => animation[action](...args));
      };

    this.animate = {
      start: delegate('start'),
      pause: delegate('pause'),
      play: delegate('play'),
      finish: delegate('finish'),
      progress: delegate('progress'),
    };
  }
}
