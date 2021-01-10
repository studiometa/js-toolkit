import BreakpointManagerDemoBase from './BreakpointManagerDemoBase';

export default class BreakpointManagerDemoMobile extends BreakpointManagerDemoBase {
  static config = {
    ...(BreakpointManagerDemoBase.config || {}),
    name: 'BreakpointManagerDemoMobile',
  };
}
