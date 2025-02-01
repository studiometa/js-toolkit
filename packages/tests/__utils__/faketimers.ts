import { vi } from 'vitest';

let isUsingFakeTimers = false;

export function isFakeTime() {
  return isUsingFakeTimers;
}

export function useFakeTimers(fakeTimersConfig?: Parameters<typeof vi.useFakeTimers>[0]) {
  vi.useFakeTimers(fakeTimersConfig)
  isUsingFakeTimers = true;
}

export function useRealTimers() {
  vi.useRealTimers();
  isUsingFakeTimers = false;
}

export function advanceTimersByTime(msToRun: number) {
  vi.advanceTimersByTime(msToRun);
}

export async function advanceTimersByTimeAsync(msToRun: number) {
  return vi.advanceTimersByTimeAsync(msToRun);
}

export function runAllTimers() {
  vi.runAllTimers();
}
