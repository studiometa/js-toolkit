/* eslint-disable no-underscore-dangle */
import { Base } from '../../../../src';
import useResize from '../../../../src/services/resize';
import nextFrame from '../../../../src/utils/nextFrame';

export default class MediaQuery extends Base {
  get config() {
    return {
      name: 'MediaQuery',
      breakpoints: '',
      debug: true,
    };
  }

  mounted() {
    Object.defineProperty(this, 'child', {
      get: () => (this.$el.firstElementChild || {}).__base__ || false,
    });

    Object.defineProperty(this, 'currentBreakpoint', {
      get: () => useResize().props().breakpoint || false,
    });

    Object.defineProperty(this, 'availableBreakpoints', {
      get: () => this.$options.breakpoints.split(' '),
    });

    this.test();
    nextFrame(() => this.test());
  }

  resized() {
    this.test();
  }

  test() {
    if (!this.child) {
      return;
    }

    const isInBreakpoints = this.availableBreakpoints.includes(this.currentBreakpoint);

    if (isInBreakpoints && !this.child.$isMounted) {
      this.child.$mount();
      return;
    }

    if (!isInBreakpoints && this.child.$isMounted) {
      this.child.$destroy();
    }
  }
}
