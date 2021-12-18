import { describe, afterAll, beforeEach, it, expect, sinon, spy } from 'vitest';
import scrollTo from '@studiometa/js-toolkit/utils/scrollTo';
import wait from '../__utils__/wait.js';

describe('The `scrollTo` function', () => {
  const fn = sinon.fake(({ top }) => {
    window.pageYOffset = top;
  });
  window.scrollTo = fn;

  const scrollHeightStub = sinon.stub(document.documentElement, 'scrollHeight').value(10000);

  const element = document.createElement('div');
  const elementStub = sinon.stub(element, 'getBoundingClientRect').returns({ top: 5000 });

  document.body.appendChild(element);

  afterAll(() => {
    delete window.scrollTo;
    scrollHeightStub.restore();
    elementStub.restore();
    document.body.innerHTML = '';
  });

  beforeEach(() => {
    fn.resetHistory();
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
    elementStub.returns({ top: 11000 });
    expect(fn).not.toHaveBeenCalled();
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    await scrollTo(element);
    expect(fn).toHaveBeenLastCalledWith({ top: maxScroll });
  });

  it('should stop scrolling with wheel event', async () => {
    expect(fn).not.toHaveBeenCalled();
    const fn2 = sinon.fake();
    scrollTo(element).then(fn2);
    await wait(10);
    window.dispatchEvent(new CustomEvent('wheel'));
    await wait(16);
    expect(fn2).toHaveBeenCalledTimes(1);
    const [args] = fn.args.pop();
    expect(fn2).toHaveBeenLastCalledWith(args.top);
  });

  it('should stop scrolling with touchmove event', async () => {
    expect(fn).not.toHaveBeenCalled();
    const fn2 = sinon.fake();
    scrollTo(element).then(fn2);
    await wait(10);
    window.dispatchEvent(new TouchEvent('touchmove'));
    await wait(16);
    expect(fn2).toHaveBeenCalledTimes(1);
    const [args] = fn.args.pop();
    expect(fn2).toHaveBeenLastCalledWith(args.top);
  });
});
