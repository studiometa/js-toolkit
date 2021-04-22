import { jest } from '@jest/globals';
import useResize from '@studiometa/js-toolkit/services/resize';
import resizeWindow from '../__utils__/resizeWindow';
import wait from '../__utils__/wait';

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
    expect(props().breakpoints).toBeUndefined();
    expect(props().breakpoint).toBeUndefined();

    document.body.innerHTML = '<div data-breakpoint></div>';
    await wait(100);

    expect(props().breakpoints).toEqual(['s', 'm', 'l']);
    await resizeWindow({ width: 600 });
    expect(props().breakpoint).toBe('s');
    await resizeWindow({ width: 800 });
    expect(props().breakpoint).toBe('m');
    await resizeWindow({ width: 1200 });
    expect(props().breakpoint).toBe('l');
  });
});
