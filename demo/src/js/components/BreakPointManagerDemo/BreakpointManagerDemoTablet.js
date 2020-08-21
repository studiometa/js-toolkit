import BreakpointManagerDemoBase from './BreakpointManagerDemoBase';

export default class BreakpointManagerDemoTablet extends BreakpointManagerDemoBase {
  get config() {
    return {
      ...(super.config || {}),
      name: 'BreakpointManagerDemoTablet',
    };
  }
}
