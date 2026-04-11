import { describe, it, expect, vi, afterEach } from 'vitest';
import { useScroll } from '@studiometa/js-toolkit';
import { ScrollService } from '#private/services/ScrollService.js';
import { advanceTimersByTime, dispatch, useFakeTimers, useRealTimers } from '#test-utils';
import { wait } from '#private/utils';

const OriginalResizeObserver = globalThis.ResizeObserver;

afterEach(() => {
  globalThis.ResizeObserver = OriginalResizeObserver;
});

describe('The `useScroll` service', () => {
  it('should expose a single instance', () => {
    expect(useScroll()).toBe(useScroll());
  });

  it('should implement props', () => {
    const service = useScroll();
    document.body.style.width = '1024px';
    document.body.style.height = '768px';
    expect(service.props()).toMatchInlineSnapshot(`
      {
        "changed": {
          "x": false,
          "y": false,
        },
        "changedX": false,
        "changedY": false,
        "delta": {
          "x": 0,
          "y": 0,
        },
        "deltaX": 0,
        "deltaY": 0,
        "direction": {
          "x": "NONE",
          "y": "NONE",
        },
        "isDown": false,
        "isLeft": false,
        "isRight": false,
        "isUp": false,
        "last": {
          "x": 0,
          "y": 0,
        },
        "lastX": 0,
        "lastY": 0,
        "max": {
          "x": -1024,
          "y": -768,
        },
        "maxX": -1024,
        "maxY": -768,
        "progress": {
          "x": 0,
          "y": 0,
        },
        "progressX": 0,
        "progressY": 0,
        "x": 0,
        "y": 0,
      }
    `);
  });

  it('should trigger on scroll', async () => {
    const service = useScroll();
    const fn = vi.fn();
    service.add('key', fn);
    dispatch(document, 'scroll');
    await wait(1);
    expect(fn).toHaveBeenLastCalledWith(service.props());
    fn.mockRestore();
    service.remove('key');
    dispatch(document, 'scroll');
    expect(fn).not.toHaveBeenCalled();
  });

  it('should trigger after debounce', async () => {
    const service = useScroll();
    const fn = vi.fn();
    service.add('key', fn);
    useFakeTimers();
    dispatch(document, 'scroll');
    advanceTimersByTime(101);
    useRealTimers();
    await wait();
    expect(fn).toHaveBeenCalledTimes(2);
    service.remove('key');
  });

  it('should always have a progress of 1 if the page is not scrollable', async () => {
    const spyWidth = vi.spyOn(document.scrollingElement, 'scrollWidth', 'get');
    spyWidth.mockImplementation(() => window.innerWidth);
    const spyHeight = vi.spyOn(document.scrollingElement, 'scrollHeight', 'get');
    spyHeight.mockImplementation(() => window.innerHeight);
    const service = useScroll();
    const fn = vi.fn();
    service.add('key', fn);
    dispatch(document, 'scroll');
    await wait();
    expect(service.props().maxX).toBe(0);
    expect(service.props().maxY).toBe(0);
    service.remove('key');
  });

  it('should update the direction accordingly', async () => {
    const spyWidth = vi.spyOn(document.scrollingElement, 'scrollWidth', 'get');
    spyWidth.mockImplementation(() => window.innerWidth * 2);
    const spyHeight = vi.spyOn(document.scrollingElement, 'scrollHeight', 'get');
    spyHeight.mockImplementation(() => window.innerHeight * 2);

    const scrollXSpy = vi.spyOn(window, 'scrollX', 'get');
    const scrollYSpy = vi.spyOn(window, 'scrollY', 'get');

    const service = useScroll();
    const fn = vi.fn();
    service.add('key', fn);

    scrollXSpy.mockImplementation(() => 0);
    scrollYSpy.mockImplementation(() => 0);
    dispatch(document, 'scroll');
    await wait();
    expect(service.props().direction.x).toBe('NONE');
    expect(service.props().direction.y).toBe('NONE');

    scrollXSpy.mockImplementation(() => 10);
    scrollYSpy.mockImplementation(() => 10);
    dispatch(document, 'scroll');
    await wait();
    expect(service.props().direction.x).toBe('RIGHT');
    expect(service.props().direction.y).toBe('DOWN');

    scrollXSpy.mockImplementation(() => 0);
    scrollYSpy.mockImplementation(() => 0);
    dispatch(document, 'scroll');
    await wait();
    expect(service.props().direction.x).toBe('LEFT');
    expect(service.props().direction.y).toBe('UP');

    dispatch(document, 'scroll');
    await wait();
    expect(service.props().direction.x).toBe('NONE');
    expect(service.props().direction.y).toBe('NONE');

    service.remove('key');
  });

  it('should update cached max values when the scrolling element size changes', async () => {
    let resizeObserverCallback: (() => void) | undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();

    globalThis.ResizeObserver = class ResizeObserver {
      constructor(callback: () => void) {
        resizeObserverCallback = callback;
      }

      observe = observe;
      disconnect = disconnect;
    } as unknown as typeof ResizeObserver;

    let scrollHeight = window.innerHeight * 2;
    let scrollWidth = window.innerWidth * 2;
    const spyWidth = vi.spyOn(document.scrollingElement, 'scrollWidth', 'get');
    spyWidth.mockImplementation(() => scrollWidth);
    const spyHeight = vi.spyOn(document.scrollingElement, 'scrollHeight', 'get');
    spyHeight.mockImplementation(() => scrollHeight);

    const instance = new ScrollService();
    instance.add('key', vi.fn());

    expect(observe).toHaveBeenCalledWith(document.scrollingElement);

    dispatch(document, 'scroll');
    await wait();
    expect(instance.props.maxY).toBe(window.innerHeight);
    expect(instance.props.maxX).toBe(window.innerWidth);

    scrollHeight = window.innerHeight * 3;
    scrollWidth = window.innerWidth * 3;
    resizeObserverCallback?.();

    dispatch(document, 'scroll');
    await wait();
    expect(instance.props.maxY).toBe(window.innerHeight * 2);
    expect(instance.props.maxX).toBe(window.innerWidth * 2);

    instance.remove('key');
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
