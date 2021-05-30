import { jest } from '@jest/globals';
import useResize from '@studiometa/js-toolkit/services/resize';
import resizeWindow from '../__utils__/resizeWindow';

describe('useResize', () => {
  const { add, remove, props } = useResize();

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should export the `add`, `remove` and `props` methods', () => {
    expect(typeof add).toBe('function');
    expect(typeof remove).toBe('function');
    expect(typeof props).toBe('function');
  });

  it('should not trigger the callbacks when killed', () => {
    const fn = jest.fn();
    add('key', fn);
    resizeWindow({ width: 1000 });
    jest.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
    remove('key');
    resizeWindow({ width: 800 });
    jest.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should have breakpoints props', () => {
    expect(props().breakpoints).toBeUndefined();
    expect(props().breakpoint).toBeUndefined();

    document.body.innerHTML = '<div data-breakpoint></div>';
    jest.advanceTimersByTime(100);

    expect(props().breakpoints).toEqual(['s', 'm', 'l']);
    resizeWindow({ width: 600 });
    jest.runAllTimers();
    expect(props().breakpoint).toBe('s');
    resizeWindow({ width: 800 });
    jest.runAllTimers();
    expect(props().breakpoint).toBe('m');
    resizeWindow({ width: 1200 });
    jest.runAllTimers();
    expect(props().breakpoint).toBe('l');
  });
});
