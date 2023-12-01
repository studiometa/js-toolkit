import { jest } from '@jest/globals';
import { scrollTo } from '@studiometa/js-toolkit/utils';
import wait from '../__utils__/wait.js';

describe('The `scrollTo` function', () => {
  const fn = jest.fn(({ top }) => {
    window.pageYOffset = top;
  });
  window.scrollTo = fn;

  const scrollHeightSpy = jest.spyOn(document.documentElement, 'scrollHeight', 'get');
  scrollHeightSpy.mockImplementation(() => 10000);

  const element = document.createElement('div');
  const elementSpy = jest.spyOn(element, 'getBoundingClientRect');
  elementSpy.mockImplementation(() => ({
    top: 5000,
  }));

  document.body.append(element);

  afterAll(() => {
    delete window.scrollTo;
    scrollHeightSpy.mockRestore();
    elementSpy.mockRestore();
    document.body.innerHTML = '';
  });

  beforeEach(() => {
    fn.mockClear();
    window.pageYOffset = 0;
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
