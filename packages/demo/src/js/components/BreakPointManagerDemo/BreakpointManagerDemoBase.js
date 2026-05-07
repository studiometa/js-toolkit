import { Base } from '@studiometa/js-toolkit';

/**
 *
 */
export default class BreakpointManagerDemoBase extends Base {
  static config = {
    name: 'BreakpointManagerDemoBase',
    log: false,
    refs: ['content'],
  };

  /**
   *
   */
  async mounted() {
    this.$log('mounted');
    this.$refs.content.innerHTML = this.$options.name;
  }

  /**
   *
   */
  async destroyed() {
    this.$log('destroyed');
  }

  /**
   *
   */
  onClick(event) {
    this.$log('click', event);
  }
}
