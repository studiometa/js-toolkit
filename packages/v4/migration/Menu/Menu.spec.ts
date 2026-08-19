import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Menu } from './Menu.js';
import { MenuBtn } from './MenuBtn.js';
import { MenuList } from './MenuList.js';

registerComponents(Menu, MenuBtn, MenuList);

afterEach(resetDom);

function menuMarkup(mode?: string): string {
  return `
    <div data-component="Menu" ${mode ? `data-option-mode="${mode}"` : ''}>
      <button data-component="MenuBtn" id="btn">Toggle</button>
      <ul data-component="MenuList" id="list" data-option-enter-to="open" data-option-leave-to="closed">
        <li><a href="#">Item</a></li>
      </ul>
    </div>`;
}

// Off-screen: this test environment's real Chromium can deliver a genuine
// `mouseenter` wherever the cursor happens to rest by default, and content
// rendered at the top of `document.body` is where it lands.
async function render(mode?: string): Promise<{ root: HTMLElement; menu: Menu }> {
  const root = document.createElement('div');
  root.setAttribute('style', 'position:absolute;top:300vh;left:0');
  root.innerHTML = menuMarkup(mode);
  document.body.append(root);
  await settle();
  return { root, menu: getInstance<Menu>(root.querySelector('[data-component="Menu"]'), 'Menu') };
}

describe('Menu', () => {
  it('wires up aria-controls on the button and the id on the list', async () => {
    const { root, menu } = await render();
    const btn = root.querySelector('#btn') as HTMLElement;

    expect(btn.getAttribute('aria-controls')).toBe(menu.$id);
    // Menu overwrites the list's own id with its own, same as v3 did.
    expect(menu.menuList?.$el.getAttribute('id')).toBe(menu.$id);
  });

  it('closes its list on mount', async () => {
    const { menu } = await render();
    expect(menu.menuList?.isOpen).toBe(false);
  });

  it('toggles the list on button click in click mode (the default)', async () => {
    const { root, menu } = await render();
    const btn = root.querySelector('#btn') as HTMLElement;

    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(menu.menuList?.isOpen).toBe(true);

    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(menu.menuList?.isOpen).toBe(false);
  });

  it('closes on a document click outside, in click mode', async () => {
    const { root, menu } = await render();
    menu.open();
    expect(menu.menuList?.isOpen).toBe(true);

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(menu.menuList?.isOpen).toBe(false);
  });

  it('does not close on outside click in hover mode', async () => {
    const { menu } = await render('hover');
    menu.open();

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(menu.menuList?.isOpen).toBe(true);
  });

  it('opens on button mouseenter and closes on mouseleave, in hover mode', async () => {
    const { root, menu } = await render('hover');
    const btn = root.querySelector('#btn') as HTMLElement;

    // Real `mouseenter`/`mouseleave` do not bubble; the framework's own
    // delegation reaches them through the capture phase instead (they are
    // registered in `CAPTURED_EVENTS`), which fires regardless of `.bubbles`.
    btn.dispatchEvent(new MouseEvent('mouseenter'));
    expect(menu.menuList?.isOpen).toBe(true);

    btn.dispatchEvent(new MouseEvent('mouseleave'));
    await settle();

    expect(menu.menuList?.isOpen).toBe(false);
  });

  it('closes on Escape', async () => {
    const { menu } = await render();
    menu.open();

    menu.keyed({ ESC: true, ENTER: false, isUp: true } as never);

    expect(menu.menuList?.isOpen).toBe(false);
  });

  it('toggles on Enter when the button has focus, in hover mode', async () => {
    const { root, menu } = await render('hover');
    const btn = root.querySelector('#btn') as HTMLElement;
    btn.focus();

    menu.keyed({ ENTER: true, ESC: false, isUp: true } as never);

    expect(menu.menuList?.isOpen).toBe(true);
  });

  it('closes sibling submenus when one of them opens', async () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div data-component="Menu">
        <button data-component="MenuBtn"></button>
        <ul data-component="MenuList" id="top-list">
          <li>
            <div data-component="Menu" id="sub-a">
              <button data-component="MenuBtn"></button>
              <ul data-component="MenuList" id="list-a"><li><a href="#">a</a></li></ul>
            </div>
          </li>
          <li>
            <div data-component="Menu" id="sub-b">
              <button data-component="MenuBtn"></button>
              <ul data-component="MenuList" id="list-b"><li><a href="#">b</a></li></ul>
            </div>
          </li>
        </ul>
      </div>`;
    document.body.append(root);
    await settle();
    const subA = getInstance<Menu>(root.querySelector('#sub-a'), 'Menu');
    const subB = getInstance<Menu>(root.querySelector('#sub-b'), 'Menu');

    subA.open();
    expect(subA.menuList?.isOpen).toBe(true);

    subB.open();
    expect(subB.menuList?.isOpen).toBe(true);
    expect(subA.menuList?.isOpen).toBe(false);
  });
});
