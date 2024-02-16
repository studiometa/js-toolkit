import type { Config } from '@jest/types';
import { ModernFakeTimers } from '@jest/fake-timers';

const fakeTimers = new ModernFakeTimers({
  global,
  // @ts-ignore
  config: {},
});

export function useFakeTimers(fakeTimersConfig?: Config.FakeTimersConfig) {
  fakeTimers.useFakeTimers(fakeTimersConfig);
}

export function useRealTimers() {
  fakeTimers.useRealTimers();
}

export function advanceTimersByTime(msToRun: number) {
  fakeTimers.advanceTimersByTime(msToRun);
}

export function runAllTimers() {
  fakeTimers.runAllTimers();
}
