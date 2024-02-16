import { describe, it, expect, jest, afterEach, beforeEach } from 'bun:test';
import { scrollTo, wait } from '@studiometa/js-toolkit/utils';

describe('The `scrollTo` function', () => {
  let fn;
  let element;
  let elementSpy;
  const { scrollHeight } = document.documentElement;

  beforeEach(() => {
    fn = jest.fn(({ top }) => {
      Object.defineProperty(window, 'pageYOffset', {
        value: top,
      });
    });
    window.scrollTo = fn;

    const scrollHeightSpy = jest.fn(() => 10000);
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      get() {
        return scrollHeightSpy();
      },
    });

    element = document.createElement('div');
    elementSpy = jest.spyOn(element, 'getBoundingClientRect');
    elementSpy.mockImplementation(() => ({
      top: 5000,
    }));

    document.body.innerHTML = '';
    document.body.append(element);

    Object.defineProperty(window, 'pageYOffset', {
      value: 0,
    });
  });

  afterEach(() => {
    delete window.scrollTo;
    elementSpy.mockRestore();
    document.body.innerHTML = '';
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      get() {
        return scrollHeight;
      },
    });
  });

  it('should scroll to a selector', async () => {
    expect(fn).not.toHaveBeenCalled();
    await scrollTo('div');
    expect(fn).toHaveBeenLastCalledWith({ top: 5000 });
  });

  it('should scroll to an element', async () => {
    expect(fn).not.toHaveBeenCalled();
    await scrollTo(element);
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
    await scrollTo(element);
    expect(fn).toHaveBeenLastCalledWith({ top: maxScroll });
  });

  it('should stop scrolling with wheel event', async () => {
    expect(fn).not.toHaveBeenCalled();
    const fn2 = jest.fn();
    scrollTo(element).then(fn2);
    await wait(10);
    window.dispatchEvent(new Event('wheel'));
    await wait(16);
    expect(fn2).toHaveBeenCalledTimes(1);
    const [args] = fn.mock.calls.pop();
    expect(fn2).toHaveBeenLastCalledWith(args.top);
  });

  it('should stop scrolling with touchmove event', async () => {
    expect(fn).not.toHaveBeenCalled();
    const fn2 = jest.fn();
    scrollTo(element).then(fn2);
    await wait(10);
    window.dispatchEvent(new TouchEvent('touchmove'));
    await wait(16);
    expect(fn2).toHaveBeenCalledTimes(1);
    const [args] = fn.mock.calls.pop();
    expect(fn2).toHaveBeenLastCalledWith(args.top);
  });
});