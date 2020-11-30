import Tooltip from '~/components/Tooltip';
import template from '../../docs/components/Tooltip.template.html';
import nextFrame from '~/utils/nextFrame';

describe('The Tooltip component', () => {
  let tooltip;

  beforeAll(() => {
    document.body.innerHTML = template;
    tooltip = new Tooltip(document.body.firstElementChild);
  });

  it('should be closed on instantiation', () => {
    expect(tooltip.$el.outerHTML).toBe(document.body.firstElementChild.outerHTML);
    expect(tooltip.isOpen).toBe(false);
  });

  it('should emit events when opening and closing', async () => {
    const fn = jest.fn();
    tooltip.$on('open', fn);
    tooltip.$on('close', fn);

    await tooltip.open();
    expect(fn).toHaveBeenCalledTimes(2);
    await tooltip.close();
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should update aria-attributes when opening and closing.', async () => {
    expect(tooltip.$refs.container.getAttribute('aria-hidden')).toBe('true');
    await tooltip.open();
    expect(tooltip.$refs.container.getAttribute('aria-hidden')).toBe('false');
    await tooltip.close();
  });

  it('should update refs classes and styles when opening and closing.', async () => {
    await tooltip.open();
    await nextFrame();
    expect(tooltip.$refs.container.getAttribute('style')).toBe(
      'bottom: 100%; left: 50%;'
    );
    await tooltip.close();
    await nextFrame();
    expect(tooltip.$refs.container.getAttribute('style')).toBe(
      'opacity: 0; pointer-events: none; bottom: 100%; left: 50%;'
    );
  });

  it('should open when focus the trigger.', async () => {
    const trigger = document.querySelector('[data-ref="trigger"]');
    await tooltip.close();
    expect(tooltip.isOpen).toBe(false);
    trigger.focus();
    expect(tooltip.isOpen).toBe(true);
    await nextFrame();
  });

  it('should close when unfocus the trigger.', async () => {
    const trigger = document.querySelector('[data-ref="trigger"]');
    await tooltip.open();
    expect(tooltip.isOpen).toBe(true);
    trigger.blur();
    expect(tooltip.isOpen).toBe(false);
    await nextFrame();
  });

  it('should close when pressing the escape key.', async () => {
    const escapeKeyup = new KeyboardEvent('keyup', { keyCode: 27 });
    await tooltip.open();
    expect(tooltip.isOpen).toBe(true);
    document.dispatchEvent(escapeKeyup);
    expect(tooltip.isOpen).toBe(false);
    document.dispatchEvent(escapeKeyup);
    expect(tooltip.isOpen).toBe(false);
  });

  it('should close on destroy.', async () => {
    await tooltip.open();
    expect(tooltip.isOpen).toBe(true);
    tooltip.$destroy();
    expect(tooltip.isOpen).toBe(false);
  });
});
