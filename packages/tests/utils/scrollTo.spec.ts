import { describe, it, expect, mock, spyOn, afterEach, beforeEach } from 'bun:test';
import { scrollTo } from '@studiometa/js-toolkit/utils';
import { mockScroll, restoreScroll } from '../__utils__/scroll.js';

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
    await scrollTo('div');
    expect(fn).toHaveBeenLastCalledWith({ left: 0, top: 5000 });
  });

  it('should scroll to an element', async () => {
    expect(fn).not.toHaveBeenCalled();
    await scrollTo(element);
    expect(fn).toHaveBeenLastCalledWith({ left: 0, top: 5000 });
  });

  it('should scroll to a numeric value', async () => {
    expect(fn).not.toHaveBeenCalled();
    await scrollTo(800);
    expect(fn).toHaveBeenLastCalledWith({ left: 0, top: 800 });
  });

  it('should scroll to a specific top numeric value', async () => {
    expect(fn).not.toHaveBeenCalled();
    await scrollTo({ top: 1600 });
    expect(fn).toHaveBeenLastCalledWith({ left: 0, top: 1600 });
  });

  it('should not scroll to an inexistant element', async () => {
    expect(fn).not.toHaveBeenCalled();
    const scrollY = await scrollTo('span');
    expect(scrollY).toEqual({ left: 0, top: 0 });
  });

  it('should be limited to the maximum scroll height', async () => {
    elementSpy.mockImplementation(() => ({
      top: 11000,
    }));
    expect(fn).not.toHaveBeenCalled();
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    await scrollTo(element);
    expect(fn).toHaveBeenLastCalledWith({ left: 0, top: maxScroll });
  });

  it('should stop scrolling with wheel event', async () => {
    expect(fn).not.toHaveBeenCalled();
    const fn2 = mock();
    await Promise.all([
      scrollTo(element).then(fn2),
      new Promise((resolve) => {
        setTimeout(() => {
          window.dispatchEvent(new Event('wheel'));
          resolve(true);
        }, 300);
      }),
    ]);
    expect(fn2).toHaveBeenCalledTimes(1);
    const [args] = fn.mock.calls.pop();
    expect(fn2).toHaveBeenLastCalledWith(args);
  });

  it('should stop scrolling with touchmove event', async () => {
    expect(fn).not.toHaveBeenCalled();
    const fn2 = mock();
    await Promise.all([
      scrollTo(element).then(fn2),
      new Promise((resolve) => {
        setTimeout(() => {
          window.dispatchEvent(new Event('touchmove'));
          resolve(true);
        }, 300);
      }),
    ]);
    expect(fn2).toHaveBeenCalledTimes(1);
    const [args] = fn.mock.calls.pop();
    expect(fn2).toHaveBeenLastCalledWith(args);
  });
});
