import { afterEach, describe, expect, it } from 'vitest';
import { registerComponent } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Accordion } from './Accordion.js';
import { AccordionItem } from './AccordionItem.js';

registerComponent(Accordion);

afterEach(resetDom);

function render(): HTMLElement {
  const root = document.createElement('div');
  root.setAttribute('data-component', 'Accordion');
  root.innerHTML = ['a', 'b', 'c']
    .map(
      (name) => `
      <div data-component="AccordionItem" ${name === 'a' ? 'data-option-is-open' : ''}>
        <button type="button" data-ref="btn">${name}</button>
        <div data-ref="container"><div data-ref="content">content ${name}</div></div>
      </div>`,
    )
    .join('');
  document.body.append(root);
  return root;
}

function items(root: HTMLElement): AccordionItem[] {
  return [...root.querySelectorAll('[data-component="AccordionItem"]')].map((el) =>
    getInstance<AccordionItem>(el, 'AccordionItem'),
  );
}

describe('Accordion', () => {
  it('mounts its items without being their owner', async () => {
    const root = render();
    await settle();

    const accordion = getInstance<Accordion>(root, 'Accordion');
    expect(accordion.items.size).toBe(3);
    expect(accordion.items.items.every((item) => item instanceof AccordionItem)).toBe(true);
  });

  it('wires the ARIA attributes both ways', async () => {
    const root = render();
    await settle();

    const [first, second] = items(root);
    const btn = first.$refs.btn;
    const content = first.$refs.content;

    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(btn.getAttribute('aria-controls')).toBe(content.id);
    expect(content.getAttribute('aria-labelledby')).toBe(btn.id);
    expect(content.getAttribute('aria-hidden')).toBe('false');

    expect(second.$refs.btn.getAttribute('aria-expanded')).toBe('false');
    expect(second.$refs.content.getAttribute('aria-hidden')).toBe('true');
    expect(second.$refs.container.style.height).toBe('0px');
  });

  it('toggles on a real click and keeps ARIA in sync', async () => {
    const root = render();
    await settle();

    const [, second] = items(root);
    second.$refs.btn.click();
    await settle();

    expect(second.isOpen).toBe(true);
    expect(second.$refs.btn.getAttribute('aria-expanded')).toBe('true');

    second.$refs.btn.click();
    await settle();
    expect(second.isOpen).toBe(false);
    expect(second.$refs.btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('autocloses the other items through the delegated open event', async () => {
    const root = render();
    root.setAttribute('data-option-autoclose', '');
    await settle();

    const [first, second] = items(root);
    expect(first.isOpen).toBe(true);

    second.$refs.btn.click();
    await settle();

    expect(second.isOpen).toBe(true);
    expect(first.isOpen).toBe(false);
  });

  it('re-emits open and close with the item and its index', async () => {
    const root = render();
    await settle();

    const seen: Array<[string, number]> = [];
    for (const type of ['open', 'close']) {
      root.addEventListener(type, (event) => {
        const detail = (event as CustomEvent).detail as {
          item: AccordionItem;
          index: number;
        } | null;
        if (detail) {
          seen.push([type, detail.index]);
        }
      });
    }

    items(root)[2].$refs.btn.click();
    await settle();
    items(root)[2].$refs.btn.click();
    await settle();

    expect(seen).toEqual([
      ['open', 2],
      ['close', 2],
    ]);
  });

  it('forwards the parent `item` option to items that mount before it', async () => {
    const root = document.createElement('div');
    root.setAttribute('data-component', 'Accordion');
    root.setAttribute('data-option-item', JSON.stringify({ isOpen: true }));
    root.innerHTML = `
      <div data-component="AccordionItem">
        <button type="button" data-ref="btn">a</button>
        <div data-ref="container"><div data-ref="content">content</div></div>
      </div>`;
    document.body.append(root);
    await settle();

    const [item] = items(root);
    expect(item.isOpen).toBe(true);
    expect(item.$refs.btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps the collection live when an item is added or removed', async () => {
    const root = render();
    await settle();

    const accordion = getInstance<Accordion>(root, 'Accordion');
    root.querySelector('[data-component="AccordionItem"]')?.remove();
    await settle();
    expect(accordion.items.size).toBe(2);

    const added = document.createElement('div');
    added.setAttribute('data-component', 'AccordionItem');
    added.innerHTML = `
      <button type="button" data-ref="btn">d</button>
      <div data-ref="container"><div data-ref="content">content d</div></div>`;
    root.append(added);
    await settle();
    expect(accordion.items.size).toBe(3);
    expect(accordion.items.items.at(-1)?.$el).toBe(added);
  });

  it('restores the container styles when the item leaves the DOM', async () => {
    const root = render();
    await settle();

    const [, second] = items(root);
    const { container } = second.$refs;
    expect(container.style.height).toBe('0px');

    second.$el.remove();
    await settle();
    expect(container.style.height).toBe('');
    expect(container.style.visibility).toBe('');
  });
});
