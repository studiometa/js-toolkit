import Base from '~/src';
import { withBreakpointManager } from '~/src/decorators';
import BreakpointManagerDemoMobile from './BreakpointManagerDemoMobile';
import BreakpointManagerDemoTablet from './BreakpointManagerDemoTablet';
import BreakpointManagerDemoDesktop from './BreakpointManagerDemoDesktop';

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
