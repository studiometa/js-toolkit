import { BreakpointObserver } from '../../../../src/abstracts';

export default class BreakpointObserverDemo extends BreakpointObserver {
  get config() {
    return {
      name: 'BreakpointObserverDemo',
      log: true,
    };
  }

  mounted() {
    this.$log('mounted');
    this.$refs.content.innerHTML = `${this.$options.name}: mounted`;
  }

  destroyed() {
    this.$log('destroyed');
    this.$refs.content.innerHTML = `${this.$options.name}: destroyed`;
  }

  onClick(event) {
    this.$log('click', event);
  }
}
