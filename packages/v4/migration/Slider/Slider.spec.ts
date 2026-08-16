import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { frames, getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Slider } from './Slider.js';
import { SliderBtn } from './SliderBtn.js';
import { SliderCount } from './SliderCount.js';
import { SliderItem } from './SliderItem.js';

registerComponents(Slider, SliderBtn, SliderCount);

const ITEM_WIDTH = 100;

afterEach(resetDom);

function render({ items = 3, options = '' } = {}): HTMLElement {
  const root = document.createElement('div');
  root.setAttribute('data-component', 'Slider');
  root.innerHTML = `
    <div data-ref="wrapper" tabindex="0" style="width:${ITEM_WIDTH}px;overflow:hidden;display:flex">
      ${Array.from(
        { length: items },
        (_, index) =>
          `<div data-component="SliderItem" style="flex:0 0 ${ITEM_WIDTH}px;height:20px">${index}</div>`,
      ).join('')}
    </div>
    <button type="button" data-component="SliderBtn" data-option-prev="">prev</button>
    <button type="button" data-component="SliderBtn" data-option-next="">next</button>
    <p data-component="SliderCount"><span data-ref="current"></span>/<span data-ref="total"></span></p>
  `;
  for (const attribute of options.split(' ').filter(Boolean)) {
    root.setAttribute(attribute, '');
  }
  document.body.append(root);
  return root;
}

function get(root: HTMLElement) {
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-component="SliderBtn"]')];
  return {
    slider: getInstance<Slider>(root, 'Slider'),
    prev: buttons[0],
    next: buttons[1],
    current: root.querySelector('[data-ref="current"]') as HTMLElement,
    total: root.querySelector('[data-ref="total"]') as HTMLElement,
  };
}

async function ready(root: HTMLElement) {
  await settle();
  await frames(4);
  return get(root);
}

describe('Slider', () => {
  it('collects its items and publishes the initial state', async () => {
    const root = render();
    const { slider, current, total } = await ready(root);

    expect(slider.items.size).toBe(3);
    expect(slider.items.items.every((item) => item instanceof SliderItem)).toBe(true);
    expect(slider.state.value).toEqual({ index: 0, total: 3 });
    expect(current.textContent).toBe('1');
    expect(total.textContent).toBe('3');
  });

  it('sets the carousel accessibility attributes', async () => {
    const root = render();
    const { slider } = await ready(root);

    expect(root.getAttribute('role')).toBe('group');
    expect(root.getAttribute('aria-roledescription')).toBe('carousel');
    const [item] = slider.items.items;
    expect(item.$el.getAttribute('aria-roledescription')).toBe('slide');
    expect(item.$el.getAttribute('aria-label')).toBe(item.id);
  });

  it('navigates on a real click and moves every slide', async () => {
    const root = render();
    const { slider, next } = await ready(root);

    next.click();
    await frames(30);

    expect(slider.currentIndex).toBe(1);
    for (const item of slider.items) {
      expect(item.x).toBe(-ITEM_WIDTH);
      expect(item.$el.style.transform).toContain('translate3d(-');
    }
  });

  it('flags the active slide', async () => {
    const root = render();
    const { slider, next } = await ready(root);
    const [first, second] = slider.items.items;

    expect(first.$el.classList.contains('is-active')).toBe(true);

    next.click();
    await frames(4);
    expect(first.$el.classList.contains('is-active')).toBe(false);
    expect(second.$el.classList.contains('is-active')).toBe(true);
  });

  it('updates every control through the provided signal', async () => {
    const root = render();
    const { slider, next, current } = await ready(root);

    next.click();
    await frames(4);

    expect(current.textContent).toBe('2');
    expect(slider.state.value).toEqual({ index: 1, total: 3 });
  });

  it('disables the buttons at the bounds', async () => {
    const root = render({ items: 2 });
    const { next, prev } = await ready(root);

    expect(prev.disabled).toBe(true);
    expect(next.disabled).toBe(false);

    next.click();
    await frames(4);
    expect(prev.disabled).toBe(false);
    expect(next.disabled).toBe(true);
  });

  it('navigates with the arrow keys when the wrapper has the focus', async () => {
    const root = render();
    const { slider } = await ready(root);
    const wrapper = root.querySelector('[data-ref="wrapper"]') as HTMLElement;

    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await frames(2);
    expect(slider.currentIndex).toBe(1);

    wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await frames(2);
    expect(slider.currentIndex).toBe(0);

    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await frames(2);
    expect(slider.currentIndex).toBe(0);
  });

  it('reacts to a slide added after mount', async () => {
    const root = render({ items: 2 });
    const { slider, total, next } = await ready(root);
    expect(slider.items.size).toBe(2);

    const added = document.createElement('div');
    added.setAttribute('data-component', 'SliderItem');
    added.style.cssText = `flex:0 0 ${ITEM_WIDTH}px;height:20px`;
    (root.querySelector('[data-ref="wrapper"]') as HTMLElement).append(added);
    await ready(root);

    expect(slider.items.size).toBe(3);
    expect(total.textContent).toBe('3');
    expect(next.disabled).toBe(false);
  });

  it('clamps instead of throwing when the active slide is removed', async () => {
    const root = render({ items: 3 });
    const { slider, next } = await ready(root);

    next.click();
    next.click();
    await frames(4);
    expect(slider.currentIndex).toBe(2);

    slider.items.items[2].$el.remove();
    await ready(root);

    expect(slider.items.size).toBe(2);
    expect(slider.currentIndex).toBe(1);
    expect(slider.state.value).toEqual({ index: 1, total: 2 });
  });

  it('connects a control that mounts before its slider', async () => {
    const count = document.createElement('p');
    count.setAttribute('data-component', 'SliderCount');
    count.innerHTML = '<span data-ref="current"></span>';
    document.body.append(count);
    await settle();
    expect(count.textContent).toBe('');

    const root = render();
    root.append(count);
    await ready(root);

    expect(count.querySelector('[data-ref="current"]')?.textContent).toBe('1');
  });

  it('leaves a control with no slider above it inert', async () => {
    const button = document.createElement('button');
    button.setAttribute('data-component', 'SliderBtn');
    button.setAttribute('data-option-next', '');
    document.body.append(button);
    await settle();

    button.click();
    await frames(2);
    expect(button.disabled).toBe(false);
  });

  it('resets a slide position when it leaves the DOM', async () => {
    const root = render();
    const { slider, next } = await ready(root);

    next.click();
    await frames(30);
    const [first] = slider.items.items;
    expect(first.x).toBe(-ITEM_WIDTH);

    first.$el.remove();
    await ready(root);
    expect(first.x).toBe(0);
  });
});
