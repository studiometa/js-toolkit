import BreakpointManagerDemoBase from './BreakpointManagerDemoBase';

export default class BreakpointManagerDemoMobile extends BreakpointManagerDemoBase {
  get config() {
    return {
      ...(super.config || {}),
      name: 'BreakpointManagerDemoMobile',
    };
  }
}
