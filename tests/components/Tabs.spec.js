/* eslint-disable no-new, require-jsdoc, max-classes-per-file */
import Tabs from '~/components/Tabs';
import template from '../../docs/components/Tabs.template.html';
import nextFrame from '~/utils/nextFrame';

describe('The Tabs component', () => {
  let tabs;

  beforeEach(() => {
    document.body.innerHTML = template;
    tabs = new Tabs(document.body.firstElementChild);
  });

  it('should emit `enable` and `disable` events.', () => {
    const enableFn = jest.fn();
    const disableFn = jest.fn();
    tabs.$on('enable', enableFn);
    tabs.$on('disable', disableFn);

    tabs.$refs.btn[0].click();
    expect(enableFn).toHaveBeenCalledTimes(1);
    expect(disableFn).toHaveBeenCalledTimes(tabs.$refs.btn.length - 1);

    tabs.$refs.btn[1].click();
    expect(enableFn).toHaveBeenCalledTimes(2);
    expect(enableFn).toHaveBeenLastCalledWith({
      btn: tabs.$refs.btn[1],
      content: tabs.$refs.content[1],
    });
    expect(disableFn).toHaveBeenCalledTimes((tabs.$refs.btn.length - 1) * 2);
    tabs.$off('enable');
    tabs.$off('disable');
  });

  it('should update aria-attributes when opening and closing.', () => {
    tabs.$refs.btn[0].click();
    expect(tabs.$refs.content[1].getAttribute('aria-hidden')).toBe('true');
    tabs.$refs.btn[1].click();
    expect(tabs.$refs.content[1].getAttribute('aria-hidden')).toBe('false');
  });

  it('should not be working when destroyed.', async () => {
    const fn = jest.fn();
    tabs.$on('enable', fn);
    tabs.$refs.btn[0].click();
    expect(fn).toHaveBeenCalledTimes(1);
    tabs.$destroy();
    await nextFrame();
    tabs.$refs.btn[0].click();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
