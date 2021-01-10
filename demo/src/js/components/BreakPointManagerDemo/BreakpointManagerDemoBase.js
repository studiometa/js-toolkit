import Base from '~/src';

export default class BreakpointManagerDemoBase extends Base {
  get config() {
    return {
      log: false,
      refs: ['content'],
    };
  }

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
