import { jest } from '@jest/globals';
import { useResize } from '@studiometa/js-toolkit';
import { features } from '@studiometa/js-toolkit/Base/features.js';
import { matchMedia } from '../__utils__/matchMedia.js';
import resizeWindow from '../__utils__/resizeWindow.js';

describe('useResize', () => {
  const { add, remove, props } = useResize();

  it('should export the `add`, `remove` and `props` methods', () => {
    expect(typeof add).toBe('function');
    expect(typeof remove).toBe('function');
    expect(typeof props).toBe('function');
  });

  it('should not trigger the callbacks when killed', async () => {
    const fn = jest.fn();
    add('key', fn);
    await resizeWindow({ width: 1000 });
    expect(fn).toHaveBeenCalledTimes(1);
    remove('key');
    await resizeWindow({ width: 800 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should have breakpoints props', async () => {
    expect(props().breakpoints.length).toBeGreaterThan(0);

    const breakpoints = features.get('breakpoints');
    expect(props().breakpoints).toEqual(Object.keys(breakpoints));

    for (const [key, value] of Object.entries(breakpoints)) {
      matchMedia.useMediaQuery(`(min-width: ${value})`);
      expect(props().breakpoint).toBe(key);
      expect(props().activeBreakpoints[key]).toBe(true);
    }
  });
});
