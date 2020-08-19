import { BreakpointManager } from '../../../../../src/abstracts';
import BreakpointManagerDemoMobile from './BreakpointManagerDemoMobile';
import BreakpointManagerDemoTablet from './BreakpointManagerDemoTablet';
import BreakpointManagerDemoDesktop from './BreakpointManagerDemoDesktop';

export default class BreakpointManagerDemo extends BreakpointManager {
  get config() {
    return {
      name: 'BreakpointManagerDemo',
      log: true,
      breakpoints: [
        ['s', BreakpointManagerDemoMobile],
        ['m', BreakpointManagerDemoTablet],
        ['l', BreakpointManagerDemoDesktop],
      ],
    };
  }

  mounted() {
    this.$log('mounted');
  }

  resized({ breakpoint }) {
    this.$log('breakpoint:', breakpoint);
  }
}
