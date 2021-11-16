import { jest } from '@jest/globals';
import transition from '@studiometa/js-toolkit/utils/css/transition';

describe('transition method', () => {
  let el;
  let spyAdd;
  let spyRemove;
  let spyStyle;

  beforeEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = `
      <div class="w-16 h-16 m-10 bg-black"></div>
    `;
    el = document.body.firstElementChild;
    spyAdd = jest.spyOn(el.classList, 'add');
    spyRemove = jest.spyOn(el.classList, 'remove');
    spyStyle = jest.spyOn(el.style, 'opacity', 'set');
  });

  it('should work server side', async () => {
    // Mock window === undefined
    // @see https://stackoverflow.com/a/56999581
    const windowSpy = jest.spyOn(globalThis, 'window', 'get');
    windowSpy.mockImplementation(() => undefined);
    await transition(el, 'name');
    expect(spyAdd).toHaveBeenCalledWith('name-from');
    windowSpy.mockRestore();
  });

  it('should work with a string parameter', async () => {
    el.style.transitionDuration = '0.1s';
    setTimeout(() => {
      el.dispatchEvent(new CustomEvent('transitionend'));
    }, 100);
    await transition(el, 'name');
    expect(spyAdd).toHaveBeenNthCalledWith(1, 'name-from');
    expect(spyAdd).toHaveBeenNthCalledWith(2, 'name-active');
    expect(spyAdd).toHaveBeenNthCalledWith(3, 'name-to');
    expect(spyRemove).toHaveBeenNthCalledWith(1, 'name-from');
    expect(spyRemove).toHaveBeenNthCalledWith(2, 'name-to');
    expect(spyRemove).toHaveBeenNthCalledWith(3, 'name-active');
  });

  it('should work with an object parameter', async () => {
    await transition(el, {
      from: { opacity: '0' },
      active: 'transition duration-500',
      to: 'transform scale-50',
    });
    expect(spyStyle).toHaveBeenNthCalledWith(1, '0');
    expect(spyAdd).toHaveBeenNthCalledWith(1, 'transition');
    expect(spyAdd).toHaveBeenNthCalledWith(2, 'duration-500');
    expect(spyAdd).toHaveBeenNthCalledWith(3, 'transform');
    expect(spyAdd).toHaveBeenNthCalledWith(4, 'scale-50');
    expect(spyStyle).toHaveBeenNthCalledWith(2, '');
    expect(spyRemove).toHaveBeenNthCalledWith(1, 'transform');
    expect(spyRemove).toHaveBeenNthCalledWith(2, 'scale-50');
    expect(spyRemove).toHaveBeenNthCalledWith(3, 'transition');
    expect(spyRemove).toHaveBeenNthCalledWith(4, 'duration-500');
  });

  it('should stop any previous transition', async () => {
    el.style.transitionDuration = '1s';
    setTimeout(() => {
      el.dispatchEvent(new CustomEvent('transitionend'));
    }, 100);
    transition(el, 'name');
    await transition(el, 'name');
    expect(spyRemove).toHaveBeenNthCalledWith(1, 'name-to');
    expect(spyRemove).toHaveBeenNthCalledWith(2, 'name-active');
  });
});
