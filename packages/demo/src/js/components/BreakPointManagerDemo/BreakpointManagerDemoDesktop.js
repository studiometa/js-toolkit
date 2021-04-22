import BreakpointManagerDemoBase from './BreakpointManagerDemoBase.js';

export default class BreakpointManagerDemoDesktop extends BreakpointManagerDemoBase {
  static config = {
    ...(BreakpointManagerDemoBase.config || {}),
    name: 'BreakpointManagerDemoDesktop',
  };
}
