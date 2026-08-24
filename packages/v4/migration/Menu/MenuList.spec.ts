import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { MenuList } from './MenuList.js';

registerComponents(MenuList);

afterEach(resetDom);

/**
 * `open()`/`close()` start their transition and do not return it, and a kept
 * end state only lands a few frames later — after `nextFrame`, the `from` and
 * `active` states, and either a `transitionend` or one more frame. A single
 * `settle()` is usually enough and is not a guarantee: under full-suite load
 * these assertions failed intermittently. Poll for the class instead.
 */
async function waitForClass(el: HTMLElement, className: string, timeout = 1000): Promise<void> {
  const deadline = Date.now() + timeout;
  while (!el.classList.contains(className)) {
    if (Date.now() > deadline) {
      throw new Error(`waitForClass: "${className}" never landed on the element`);
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

async function render(): Promise<{
  root: HTMLElement;
  outer: MenuList;
  nested: MenuList;
  outerLink: HTMLElement;
  nestedLink: HTMLElement;
}> {
  const root = document.createElement('div');
  root.innerHTML = `
    <ul data-component="MenuList" data-option-enter-to="open" data-option-leave-to="closed" id="outer-list">
      <li><a href="#" id="outer-link">Link 1</a></li>
      <li>
        <ul data-component="MenuList" data-option-enter-to="nested-open" data-option-leave-to="nested-closed" id="nested-list">
          <li><a href="#" id="nested-link">Nested link</a></li>
        </ul>
      </li>
    </ul>`;
  document.body.append(root);
  await settle();
  return {
    root,
    outer: getInstance<MenuList>(root.querySelector('#outer-list'), 'MenuList'),
    nested: getInstance<MenuList>(root.querySelector('#nested-list'), 'MenuList'),
    outerLink: root.querySelector('#outer-link') as HTMLElement,
    nestedLink: root.querySelector('#nested-link') as HTMLElement,
  };
}

describe('MenuList', () => {
  it('closes tabindex on its own focusable elements on mount, nested lists excluded from double-handling', async () => {
    const { outerLink, nestedLink } = await render();
    expect(outerLink.getAttribute('tabindex')).toBe('-1');
    expect(nestedLink.getAttribute('tabindex')).toBe('-1');
  });

  it('opens: restores tabindex on its own items only, sets aria-hidden, keeps the enter-to class, emits items-open', async () => {
    const { outer, outerLink, nestedLink } = await render();
    const events: string[] = [];
    outer.$el.addEventListener('items-open', () => events.push('items-open'));

    outer.open();
    await waitForClass(outer.$el, 'open');

    expect(outer.isOpen).toBe(true);
    expect(outer.$el.getAttribute('aria-hidden')).toBe('false');
    expect(outerLink.hasAttribute('tabindex')).toBe(false);
    // A nested list's own item is untouched by the outer list's open().
    expect(nestedLink.getAttribute('tabindex')).toBe('-1');
    expect(events).toEqual(['items-open']);
  });

  it('closes: re-applies tabindex, sets aria-hidden, keeps the leave-to class, emits items-close, and closes nested lists', async () => {
    const { outer, nested, outerLink } = await render();
    outer.open();
    nested.open();
    await settle();

    // Closing recursively closes the nested list too, which also emits
    // `items-close` and bubbles to this same listener: filter to the outer
    // list's own event.
    const events: string[] = [];
    outer.$el.addEventListener('items-close', (event) => {
      if (event.target === outer.$el) {
        events.push('items-close');
      }
    });

    outer.close();
    await waitForClass(outer.$el, 'closed');

    expect(outer.isOpen).toBe(false);
    expect(outer.$el.getAttribute('aria-hidden')).toBe('true');
    expect(outerLink.getAttribute('tabindex')).toBe('-1');
    expect(events).toEqual(['items-close']);
    // Closing the outer list recursively closes the nested one too.
    expect(nested.isOpen).toBe(false);
  });

  it('blurs the focused element within it when it closes', async () => {
    const { outer, outerLink } = await render();
    outer.open();
    outerLink.focus();
    expect(document.activeElement).toBe(outerLink);

    outer.close();

    expect(document.activeElement).not.toBe(outerLink);
  });

  it('toggles between open and closed', async () => {
    const { outer } = await render();

    outer.toggle();
    expect(outer.isOpen).toBe(true);

    outer.toggle();
    expect(outer.isOpen).toBe(false);
  });

  it('is a no-op to close an already-closed list', async () => {
    const { outer } = await render();
    const events: string[] = [];
    outer.$el.addEventListener('items-close', () => events.push('items-close'));

    outer.close();

    expect(events).toEqual([]);
  });
});
