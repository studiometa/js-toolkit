import { jest } from '@jest/globals';
import useScroll from '@studiometa/js-toolkit/services/scroll';
import resizeWindow from '../__utils__/resizeWindow';

jest.useFakeTimers();

describe('useScroll', () => {
  const { add, remove, props } = useScroll();
  let fn;
  let scrollProps;

  beforeEach(() => {
    resizeWindow({ width: 1000, height: 1000 });
    jest.runAllTimers();
    remove('key');
    fn = jest.fn((p) => {
      scrollProps = p;
    });
    add('key', fn);
  });

  it('should export the `add`, `remove` and `props` methods', () => {
    expect(typeof add).toBe('function');
    expect(typeof remove).toBe('function');
    expect(typeof props).toBe('function');
  });

  it('should show a progress of 1 if there is no scroll', () => {
    const scrollWidthSpy = jest.spyOn(document.body, 'scrollWidth', 'get');
    scrollWidthSpy.mockImplementation(() => window.innerWidth);

    const scrollHeightSpy = jest.spyOn(document.body, 'scrollHeight', 'get');
    scrollHeightSpy.mockImplementation(() => window.innerHeight);

    document.dispatchEvent(new CustomEvent('scroll'));
    jest.advanceTimersByTime(100);

    expect(scrollProps.progress).toEqual({ x: 1, y: 1 });

    scrollWidthSpy.mockRestore();
    scrollHeightSpy.mockRestore();
  });

  it('should trigger the callbacks on scroll', () => {
    expect(fn).toHaveBeenCalledTimes(0);

    const scrollWidthSpy = jest.spyOn(document.body, 'scrollWidth', 'get');
    scrollWidthSpy.mockImplementation(() => window.innerWidth * 2);

    const scrollHeightSpy = jest.spyOn(document.body, 'scrollHeight', 'get');
    scrollHeightSpy.mockImplementation(() => window.innerHeight * 2);

    document.dispatchEvent(new CustomEvent('scroll'));
    jest.advanceTimersByTime(100);

    expect(scrollProps).toEqual({
      x: 0,
      y: 0,
      changed: { x: false, y: false },
      last: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
      progress: { x: 0, y: 0 },
      max: { x: 1000, y: 1000 },
    });

    expect(fn).toHaveBeenCalledTimes(3);

    window.pageYOffset = 100;
    window.pageXOffset = 100;
    document.dispatchEvent(new CustomEvent('scroll'));
    expect(scrollProps).toEqual({
      x: 100,
      y: 100,
      changed: { x: true, y: true },
      last: { x: 0, y: 0 },
      delta: { x: 100, y: 100 },
      progress: { x: 0.1, y: 0.1 },
      max: { x: 1000, y: 1000 },
    });

    remove('key');
    document.dispatchEvent(new CustomEvent('scroll'));
    expect(fn).toHaveBeenCalledTimes(4);

    scrollWidthSpy.mockRestore();
    scrollHeightSpy.mockRestore();
  });
});
