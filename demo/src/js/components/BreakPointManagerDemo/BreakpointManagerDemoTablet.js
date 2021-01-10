import BreakpointManagerDemoBase from './BreakpointManagerDemoBase';

export default class BreakpointManagerDemoTablet extends BreakpointManagerDemoBase {
  static config = {
    ...(BreakpointManagerDemoBase.config || {}),
    name: 'BreakpointManagerDemoTablet',
  };
}
