import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextFrame } from '@studiometa/js-toolkit/utils';
import { useFakeTimers, useRealTimers, runAllTimers, advanceTimersByTime } from '#test-utils';

let mockedHasWindow = true;

vi.mock(import('#private/utils/has.js'), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    hasWindow: () => mockedHasWindow,
  };
});

beforeEach(() => {
  mockedHasWindow = true;
  useFakeTimers();
});

afterEach(() => {
  mockedHasWindow = true;
  useRealTimers();
});

describe('nextFrame method', () => {
  it('should execute the callback function in the next frame', () => {
    const fn = vi.fn();
    nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should work without callback', () => {
    expect(nextFrame()).toBeInstanceOf(Promise);
  });

  it('should work server-side', () => {
    mockedHasWindow = false;

    const fn = vi.fn();
    nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    advanceTimersByTime(16);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
