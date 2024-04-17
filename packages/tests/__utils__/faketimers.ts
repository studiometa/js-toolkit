import type { Config } from '@jest/types';
import { ModernFakeTimers } from '@jest/fake-timers';

const fakeTimers = new ModernFakeTimers({
  global,
  // @ts-ignore
  config: {},
});

let isUsingFakeTimers = false;

export function isFakeTime() {
  return isUsingFakeTimers;
}

export function useFakeTimers(fakeTimersConfig?: Config.FakeTimersConfig) {
  fakeTimers.useFakeTimers(fakeTimersConfig);
  isUsingFakeTimers = true;
}

export function useRealTimers() {
  fakeTimers.useRealTimers();
  isUsingFakeTimers = false;
}

export function advanceTimersByTime(msToRun: number) {
  fakeTimers.advanceTimersByTime(msToRun);
}

export async function advanceTimersByTimeAsync(msToRun: number) {
  return fakeTimers.advanceTimersByTimeAsync(msToRun);
}

export function runAllTimers() {
  fakeTimers.runAllTimers();
}
