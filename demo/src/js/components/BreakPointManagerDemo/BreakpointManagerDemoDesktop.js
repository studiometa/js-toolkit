import BreakpointManagerDemoBase from './BreakpointManagerDemoBase';

export default class BreakpointManagerDemoDesktop extends BreakpointManagerDemoBase {
  get config() {
    return {
      ...(super.config || {}),
      name: 'BreakpointManagerDemoDesktop',
    };
  }
}
