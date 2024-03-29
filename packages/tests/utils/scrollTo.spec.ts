import { describe, it, expect, mock, spyOn, afterEach, beforeEach } from 'bun:test';
import { scrollTo } from '@studiometa/js-toolkit/utils';
import { mockScroll, restoreScroll } from '../__utils__/scroll.js';
import {
  useFakeTimers,
  useRealTimers,
  runAllTimers,
  advanceTimersByTimeAsync,
} from '../__utils__/faketimers.js';

describe('The `scrollTo` function', () => {
  let fn;
  let element;
  let elementSpy;

  beforeEach(() => {
    fn = mock(({ top }) => {
      window.scrollY = top;
    });
    window.scrollTo = fn;

    mockScroll({ height: 10000 });

    element = document.createElement('div');
    elementSpy = spyOn(element, 'getBoundingClientRect');
    elementSpy.mockImplementation(() => ({
      top: 5000,
    }));

    document.body.innerHTML = '';
    document.body.append(element);
  });

  afterEach(() => {
    window.scrollY = 0;
    elementSpy.mockRestore();
    document.body.innerHTML = '';
    restoreScroll();
  });

  it('should scroll to a selector', async () => {
    expect(fn).not.toHaveBeenCalled();
    useFakeTimers();
    scrollTo('div');
    runAllTimers();
    useRealTimers();
    expect(fn).toHaveBeenLastCalledWith({ top: 5000 });
  });

  it('should scroll to an element', async () => {
    expect(fn).not.toHaveBeenCalled();
    useFakeTimers();
    scrollTo(element);
    runAllTimers();
    useRealTimers();
    expect(fn).toHaveBeenLastCalledWith({ top: 5000 });
  });

  it('should not scroll to an inexistant element', async () => {
    expect(fn).not.toHaveBeenCalled();
    const scrollY = await scrollTo('span');
    expect(scrollY).toEqual(0);
  });

  it('should be limited to the maximum scroll height', async () => {
    elementSpy.mockImplementation(() => ({
      top: 11000,
    }));
    expect(fn).not.toHaveBeenCalled();
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    useFakeTimers();
    scrollTo(element);
    runAllTimers();
    useRealTimers();
    expect(fn).toHaveBeenLastCalledWith({ top: maxScroll });
  });

  it('should stop scrolling with wheel event', async () => {
    expect(fn).not.toHaveBeenCalled();
    const fn2 = mock();
    useFakeTimers();
    scrollTo(element).then(fn2);
    await advanceTimersByTimeAsync(10);
    window.dispatchEvent(new Event('wheel'));
    await advanceTimersByTimeAsync(16);
    useRealTimers();
    expect(fn2).toHaveBeenCalledTimes(1);
    const [args] = fn.mock.calls.pop();
    expect(fn2).toHaveBeenLastCalledWith(args.top);
  });

  it('should stop scrolling with touchmove event', async () => {
    expect(fn).not.toHaveBeenCalled();
    const fn2 = mock();
    useFakeTimers();
    scrollTo(element).then(fn2);
    await advanceTimersByTimeAsync(10);
    window.dispatchEvent(new TouchEvent('touchmove'));
    await advanceTimersByTimeAsync(16);
    useRealTimers();
    expect(fn2).toHaveBeenCalledTimes(1);
    const [args] = fn.mock.calls.pop();
    expect(fn2).toHaveBeenLastCalledWith(args.top);
  });
});
