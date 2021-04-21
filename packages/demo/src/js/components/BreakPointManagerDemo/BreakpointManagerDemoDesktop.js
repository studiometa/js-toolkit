import BreakpointManagerDemoBase from './BreakpointManagerDemoBase';

export default class BreakpointManagerDemoDesktop extends BreakpointManagerDemoBase {
  static config = {
    ...(BreakpointManagerDemoBase.config || {}),
    name: 'BreakpointManagerDemoDesktop',
  };
}
