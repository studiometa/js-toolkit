import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { MenuBtn } from './MenuBtn.js';

registerComponents(MenuBtn);

afterEach(resetDom);

async function render(): Promise<{ el: HTMLElement; instance: MenuBtn }> {
  const root = document.createElement('div');
  root.innerHTML = `<button data-component="MenuBtn"></button>`;
  document.body.append(root);
  await settle();
  const el = root.firstElementChild as HTMLElement;
  return { el, instance: getInstance<MenuBtn>(el, 'MenuBtn') };
}

describe('MenuBtn', () => {
  it('tracks its own hover state', async () => {
    const { instance } = await render();

    instance.onMouseenter(new MouseEvent('mouseenter'));
    expect(instance.isHover).toBe(true);

    instance.onMouseleave(new MouseEvent('mouseleave'));
    expect(instance.isHover).toBe(false);
  });

  it('stops propagation so a wrapping list does not also count the hover', async () => {
    const { instance } = await render();
    const enter = new MouseEvent('mouseenter', { bubbles: true, cancelable: true });
    const leave = new MouseEvent('mouseleave', { bubbles: true, cancelable: true });

    instance.onMouseenter(enter);
    instance.onMouseleave(leave);

    expect(enter.cancelBubble).toBe(true);
    expect(leave.cancelBubble).toBe(true);
  });
});
