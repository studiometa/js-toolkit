import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { transition } from '@studiometa/js-toolkit/utils';
import { useFakeTimers, useRealTimers, advanceTimersByTimeAsync } from '#test-utils';

describe('transition method', () => {
  let el;
  let spyAdd;
  let spyRemove;
  let spyStyle;

  beforeEach(() => {
    useFakeTimers();
    document.body.innerHTML = `
      <div class="w-16 h-16 m-10 bg-black"></div>
    `;
    el = document.body.firstElementChild;
    spyAdd = jest.spyOn(el.classList, 'add');
    spyRemove = jest.spyOn(el.classList, 'remove');
    spyStyle = jest.fn();
    Object.defineProperty(el.style, 'opacity', {
      configurable: true,
      set(value) {
        spyStyle(value);
      },
    });
  });

  afterEach(() => {
    useRealTimers();
  });

  it('should work with a string parameter', async () => {
    el.style.transitionDuration = '0.1s';
    setTimeout(() => {
      el.dispatchEvent(new CustomEvent('transitionend'));
    }, 100);
    transition(el, 'name');
    await advanceTimersByTimeAsync(200)
    expect(spyAdd).toHaveBeenNthCalledWith(1, 'name-from');
    expect(spyAdd).toHaveBeenNthCalledWith(2, 'name-active');
    expect(spyAdd).toHaveBeenNthCalledWith(3, 'name-to');
    expect(spyRemove).toHaveBeenNthCalledWith(1, 'name-from');
    expect(spyRemove).toHaveBeenNthCalledWith(2, 'name-to');
    expect(spyRemove).toHaveBeenNthCalledWith(3, 'name-active');
  });

  it('should work with an object parameter', async () => {
    transition(el, {
      from: { opacity: '0' },
      active: 'transition duration-500',
      to: 'transform scale-50',
    });
    await advanceTimersByTimeAsync(1000);
    expect(spyStyle).toHaveBeenCalledWith('0');
    expect(spyAdd.mock.calls[0]).toEqual(['transition', 'duration-500']);
    expect(spyAdd.mock.calls[1]).toEqual(['transform', 'scale-50']);
    expect(spyRemove.mock.calls[0]).toEqual(['transform', 'scale-50']);
    expect(spyRemove.mock.calls[1]).toEqual(['transition', 'duration-500']);
  });

  it('should stop any previous transition', async () => {
    // review the way the previous transition is stopped, as the `end` function
    // is called with the new transition options instead of the old ones
    el.style.transitionDuration = '1s';
    setTimeout(() => {
      el.dispatchEvent(new CustomEvent('transitionend'));
    }, 100);
    transition(el, 'name-1');
    await advanceTimersByTimeAsync(50);
    transition(el, 'name-2');
    await advanceTimersByTimeAsync(200);
    expect(spyRemove).toHaveBeenNthCalledWith(1, 'name-1-from');
    expect(spyRemove).toHaveBeenNthCalledWith(2, 'name-2-to');
  });
});
