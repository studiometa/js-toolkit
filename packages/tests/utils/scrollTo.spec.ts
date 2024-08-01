import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { scrollTo } from '@studiometa/js-toolkit/utils';
import {
  mockScroll,
  restoreScroll,
  useFakeTimers,
  useRealTimers,
  advanceTimersByTimeAsync,
  h,
} from '#test-utils';

describe('The `scrollTo` function', () => {
  let fn;
  let element;
  let elementSpy;

  beforeEach(() => {
    fn = vi.fn(({ top, left }) => {
      window.scrollY = top;
      window.scrollX = left;
    });
    window.scrollTo = fn;

    mockScroll({ height: 10000, width: 10000 });

    element = document.createElement('div');
    elementSpy = vi.spyOn(element, 'getBoundingClientRect');
    elementSpy.mockImplementation(() => ({
      top: 5000,
      left: 5000,
    }));

    document.body.innerHTML = '';
    document.body.append(element);
    useFakeTimers();
  });

  afterEach(() => {
    useRealTimers();
    window.scrollY = 0;
    window.scrollX = 0;
    elementSpy.mockRestore();
    document.body.innerHTML = '';
    restoreScroll();
  });

  it('should scroll to a selector', async () => {
    expect(fn).not.toHaveBeenCalled();
    scrollTo('div');
    await advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenLastCalledWith({ left: 0, top: 5000 });
  });

  it('should scroll to an element', async () => {
    expect(fn).not.toHaveBeenCalled();
    scrollTo(element);
    await advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenLastCalledWith({ left: 0, top: 5000 });
  });

  it('should scroll to a numeric value', async () => {
    expect(fn).not.toHaveBeenCalled();
    scrollTo(800);
    await advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenLastCalledWith({ left: 0, top: 800 });
  });

  it('should scroll to a specific top numeric value', async () => {
    expect(fn).not.toHaveBeenCalled();
    scrollTo({ top: 1600 });
    await advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenLastCalledWith({ left: 0, top: 1600 });
  });

  it('should scroll to a specific left numeric value', async () => {
    expect(fn).not.toHaveBeenCalled();
    scrollTo({ left: 1600 });
    await advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenLastCalledWith({ left: 1600, top: 0 });
  });

  it('should scroll to a left and top numeric value', async () => {
    expect(fn).not.toHaveBeenCalled();
    scrollTo({ left: 1600, top: 1600 }, { axis: scrollTo.axis.both });
    await advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenLastCalledWith({ top: 1600, left: 1600 });
    scrollTo({ left: 800 }, { axis: scrollTo.axis.x });
    await advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenLastCalledWith({ top: 1600, left: 800 });
  });

  it('should not scroll to an inexistant element', async () => {
    expect(fn).not.toHaveBeenCalled();
    const scrollYPromise = scrollTo('span');
    await advanceTimersByTimeAsync(2000);
    const scrollY = await scrollYPromise;
    expect(scrollY).toEqual({ left: 0, top: 0 });
  });

  it('should be limited to the maximum scroll height', async () => {
    elementSpy.mockImplementation(() => ({
      top: 11000,
    }));
    expect(fn).not.toHaveBeenCalled();
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollTo(element);
    await advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenLastCalledWith({ left: 0, top: maxScroll });
  });

  it('should stop scrolling with wheel event', async () => {
    expect(fn).not.toHaveBeenCalled();
    const fn2 = vi.fn();
    scrollTo(element).then(fn2);
    await advanceTimersByTimeAsync(100);
    window.dispatchEvent(new Event('wheel'));
    await advanceTimersByTimeAsync(100);
    expect(fn2).toHaveBeenCalledTimes(1);
    const [args] = fn.mock.calls.pop();
    expect(fn2).toHaveBeenLastCalledWith(args);
  });

  it('should stop scrolling with touchmove event', async () => {
    expect(fn).not.toHaveBeenCalled();
    const fn2 = vi.fn();
    scrollTo(element).then(fn2);
    await advanceTimersByTimeAsync(100);
    window.dispatchEvent(new Event('touchmove'));
    await advanceTimersByTimeAsync(100);
    expect(fn2).toHaveBeenCalledTimes(1);
    const [args] = fn.mock.calls.pop();
    expect(fn2).toHaveBeenLastCalledWith(args);
  });

  it('should execute the given `onFinish` callback', async () => {
    const fn2 = vi.fn();
    scrollTo(800, { onFinish: fn2 });
    await advanceTimersByTimeAsync(2000);
    expect(fn2).toHaveBeenCalledWith(1);
  });

  it('should resolve early if the target scroll is the current scroll', async () => {
    expect(window.scrollY).toBe(0);
    scrollTo(0);
    await advanceTimersByTimeAsync(2000);
    expect(window.scrollY).toBe(0);
  });

  it('should scroll on the given rootElement', async () => {
    const div = h('div');
    mockScroll({ height: 5000, width: 5000, element: div, left: 200 });
    expect(div.scrollHeight).toBe(5000);
    scrollTo(1000, { rootElement: div });
    await advanceTimersByTimeAsync(2000);
    expect(div.scrollTop).toBe(1000);
    scrollTo(1000, { rootElement: div, axis: scrollTo.axis.x });
    await advanceTimersByTimeAsync(2000);
    expect(div.scrollLeft).toBe(1000);
    scrollTo(2000, { rootElement: div, axis: scrollTo.axis.both });
    await advanceTimersByTimeAsync(2000);
    expect(div.scrollTop).toBe(2000);
    expect(div.scrollLeft).toBe(2000);
  });
});
