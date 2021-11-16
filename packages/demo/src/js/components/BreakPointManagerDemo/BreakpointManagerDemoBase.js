import { Base } from '@studiometa/js-toolkit';

export default class BreakpointManagerDemoBase extends Base {
  static config = {
    log: false,
    refs: ['content'],
  };

  mounted() {
    this.$log('mounted');
    this.$refs.content.innerHTML = this.$options.name;
  }

  destroyed() {
    this.$log('destroyed');
  }

  onClick(event) {
    this.$log('click', event);
  }
}
