import { describe, it, expect, vi } from 'vitest';
import { useResize } from '@studiometa/js-toolkit';
import { useMatchMedia, resizeWindow, mockFeatures } from '#test-utils';

describe('The `useResize` service', () => {
  it('should return singleton based on the given breakpoints', () => {
    const service = useResize();
    expect(service).toBe(useResize());
    expect(service).not.toBe(useResize({ s: '0px', m: '100px', l: '200px' }));
  });

  it('should use the default breakpoints if none given', () => {
    const breakpoints = { s: '0px', m: '100px', l: '200px' };
    const { unmock } = mockFeatures({ breakpoints });
    const service = useResize();
    expect(service.props().breakpoints).toEqual(Object.keys(breakpoints));
    unmock();
  });

  it('should trigger on resize', async () => {
    const service = useResize();
    const fn = vi.fn();
    service.add('key', fn);
    await resizeWindow();
    expect(fn).toHaveBeenLastCalledWith(service.props());
    fn.mockRestore();
    service.remove('key');
    await resizeWindow();
    expect(fn).not.toHaveBeenCalled();
  });

  it('should return the current active breakpoint', async () => {
    const service = useResize({ s: '0px', m: '1025px', l: '2048px' });
    expect(service.props().breakpoints).toEqual(['s', 'm', 'l']);

    await resizeWindow({ width: 1025 });
    useMatchMedia('(min-width: 1025px)');
    expect(service.props().activeBreakpoints).toEqual({
      s: false,
      m: true,
      l: false,
    });
    expect(service.props().breakpoint).toBe('m');

    await resizeWindow({ width: 2048 });
    useMatchMedia('(min-width: 2048px)');
    expect(service.props().activeBreakpoints).toEqual({
      s: false,
      m: false,
      l: true,
    });
    expect(service.props().breakpoint).toBe('l');
  });

  it('should return the orientation', async () => {
    const service = useResize();
    const fn = vi.fn();

    service.add('key', fn);

    await resizeWindow({ width: 100, height: 100 });
    expect(fn).toHaveBeenLastCalledWith(service.props());
    expect(service.props().orientation).toBe('square');

    await resizeWindow({ width: 200, height: 100 });
    expect(fn).toHaveBeenLastCalledWith(service.props());
    expect(service.props().orientation).toBe('landscape');

    await resizeWindow({ width: 100, height: 200 });
    expect(fn).toHaveBeenLastCalledWith(service.props());
    expect(service.props().orientation).toBe('portrait');
  });
});
