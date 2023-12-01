import { jest } from '@jest/globals';
import { useScroll } from '@studiometa/js-toolkit';

describe('useScroll', () => {
  const { add, remove, props } = useScroll();
  let scrollProps;

  const fn = jest.fn((p) => {
    scrollProps = p;
  });
  add('key', fn);

  beforeEach(() => {
    fn.mockClear();
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
    expect(scrollProps.progress).toEqual({ x: 1, y: 1 });

    scrollWidthSpy.mockRestore();
    scrollHeightSpy.mockRestore();
  });

  it('should trigger the callbacks on scroll', async () => {
    const scrollWidthSpy = jest.spyOn(document.body, 'scrollWidth', 'get');
    scrollWidthSpy.mockImplementation(() => window.innerWidth * 2);

    const scrollHeightSpy = jest.spyOn(document.body, 'scrollHeight', 'get');
    scrollHeightSpy.mockImplementation(() => window.innerHeight * 2);

    document.dispatchEvent(new CustomEvent('scroll'));
    expect(scrollProps).toEqual({
      x: 0,
      y: 0,
      changed: { x: false, y: false },
      direction: { x: 'NONE', y: 'NONE' },
      last: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
      progress: { x: 0, y: 0 },
      max: { x: window.innerWidth, y: window.innerHeight },
    });

    expect(fn).toHaveBeenCalledTimes(1);

    const scroll = 100;
    window.pageYOffset = scroll;
    window.pageXOffset = scroll;
    document.dispatchEvent(new CustomEvent('scroll'));

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith({
      x: scroll,
      y: scroll,
      changed: { x: true, y: true },
      direction: { x: 'RIGHT', y: 'DOWN' },
      last: { x: 0, y: 0 },
      delta: { x: scroll, y: scroll },
      progress: { x: scroll / window.innerWidth, y: scroll / window.innerHeight },
      max: { x: window.innerWidth, y: window.innerHeight },
    });

    const newScroll = 50;
    window.pageYOffset = newScroll;
    window.pageXOffset = newScroll;
    document.dispatchEvent(new CustomEvent('scroll'));

    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenLastCalledWith({
      x: newScroll,
      y: newScroll,
      changed: { x: true, y: true },
      direction: { x: 'LEFT', y: 'UP' },
      last: { x: scroll, y: scroll },
      delta: { x: newScroll - scroll, y: newScroll - scroll },
      progress: { x: newScroll / window.innerWidth, y: newScroll / window.innerHeight },
      max: { x: window.innerWidth, y: window.innerHeight },
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        expect(fn).toHaveBeenCalledTimes(4);
        expect(scrollProps.changed).toEqual({ x: false, y: false });
        resolve();
      }, 150);

      scrollWidthSpy.mockRestore();
      scrollHeightSpy.mockRestore();
    });
  });

  it('should not trigger the callback when removed', () => {
    remove('key');
    document.dispatchEvent(new CustomEvent('scroll'));
    expect(fn).toHaveBeenCalledTimes(0);
  });
});
