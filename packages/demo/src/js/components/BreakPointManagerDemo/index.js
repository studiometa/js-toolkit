import { Base, withBreakpointManager } from '@studiometa/js-toolkit';
import BreakpointManagerDemoMobile from './BreakpointManagerDemoMobile.js';
import BreakpointManagerDemoTablet from './BreakpointManagerDemoTablet.js';
import BreakpointManagerDemoDesktop from './BreakpointManagerDemoDesktop.js';

export default class BreakpointManagerDemo extends withBreakpointManager(Base, [
  ['s', BreakpointManagerDemoMobile],
  ['m', BreakpointManagerDemoTablet],
  ['l', BreakpointManagerDemoDesktop],
]) {
  static config = {
    name: 'BreakpointManagerDemo',
    log: true,
    refs: ['content'],
  };

  mounted() {
    this.$log('mounted');
  }

  resized({ breakpoint }) {
    this.$log('breakpoint:', breakpoint);
  }
}
