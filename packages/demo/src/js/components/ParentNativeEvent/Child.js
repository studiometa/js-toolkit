import { Base } from '@studiometa/js-toolkit';

/**
 * Child class.
 */
export default class Child extends Base {
  /**
   * Config.
   */
  static config = {
    name: 'Child',
    log: true,
    debug: false,
  };

  msg(...msg) {
    this.$el.textContent = `[${this.$id}] ${msg.join(' ')}`;
  }

  mounted() {
    this.msg('Mounted', performance.now());
  }

  updated() {
    this.msg('Updated', performance.now());
  }

  destroyed() {
    this.$log('destroyed');
  }

  terminated() {
    this.$log('terminated');
    this.msg('Terminated', performance.now());
  }
}
