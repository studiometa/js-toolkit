import { Base } from '../../../../../src/abstracts';
import { withBreakpointManager } from '../../../../../src/decorators';
import BreakpointManagerDemoMobile from './BreakpointManagerDemoMobile';
import BreakpointManagerDemoTablet from './BreakpointManagerDemoTablet';
import BreakpointManagerDemoDesktop from './BreakpointManagerDemoDesktop';

export default class BreakpointManagerDemo extends withBreakpointManager(Base, [
  ['s', BreakpointManagerDemoMobile],
  ['m', BreakpointManagerDemoTablet],
  ['l', BreakpointManagerDemoDesktop],
]) {
  get config() {
    return {
      name: 'BreakpointManagerDemo',
      log: true,
    };
  }

  mounted() {
    this.$log('mounted');
  }

  resized({ breakpoint }) {
    this.$log('breakpoint:', breakpoint);
  }
}
