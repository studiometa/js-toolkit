import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { frames, getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Slider } from './Slider.js';
import { SliderDots } from './SliderDots.js';

registerComponents(Slider, SliderDots);

const ITEM_WIDTH = 100;

afterEach(resetDom);

function render({ items = 3 } = {}): HTMLElement {
  const root = document.createElement('div');
  root.setAttribute('data-component', 'Slider');
  root.innerHTML = `
    <div data-ref="wrapper" style="width:${ITEM_WIDTH}px;overflow:hidden;display:flex">
      ${Array.from(
        { length: items },
        (_, index) =>
          `<div data-component="SliderItem" style="flex:0 0 ${ITEM_WIDTH}px;height:20px">${index}</div>`,
      ).join('')}
    </div>
    <div data-component="SliderDots" data-option-enter-to="is-active" data-option-enter-keep>
      ${Array.from(
        { length: items },
        (_, index) => `<button type="button" data-ref="dots[]"><span>${index + 1}</span></button>`,
      ).join('')}
    </div>
  `;
  document.body.append(root);
  return root;
}

async function ready(root: HTMLElement) {
  await settle();
  await frames(4);
  const dotsEl = root.querySelector('[data-component="SliderDots"]') as HTMLElement;
  return {
    slider: getInstance<Slider>(root, 'Slider'),
    dots: getInstance<SliderDots>(dotsEl, 'SliderDots'),
    buttons: [...dotsEl.querySelectorAll<HTMLButtonElement>('[data-ref="dots[]"]')],
  };
}

const active = (buttons: HTMLButtonElement[]) =>
  buttons.map((button) => button.classList.contains('is-active'));

describe('SliderDots', () => {
  it('enters the dot of the active slide', async () => {
    const root = render();
    const { dots, buttons } = await ready(root);

    expect(dots.currentIndex).toBe(0);
    expect(active(buttons)).toEqual([true, false, false]);
  });

  it('follows the slider, entering and leaving one dot each time', async () => {
    const root = render();
    const { slider, buttons } = await ready(root);

    slider.goTo(2);
    await frames(4);
    expect(active(buttons)).toEqual([false, false, true]);

    slider.goPrev();
    await frames(4);
    expect(active(buttons)).toEqual([false, true, false]);
  });

  it('navigates on a real click, from inside the dot', async () => {
    const root = render();
    const { slider, buttons } = await ready(root);

    // The click lands on the label inside the button; the delegated ref
    // handler resolves it by walking up, so the index is still the dot's.
    (buttons[2].firstElementChild as HTMLElement).click();
    await frames(4);

    expect(slider.currentIndex).toBe(2);
    expect(active(buttons)).toEqual([false, false, true]);
  });

  it('reaches the slider through the context, not through its class', async () => {
    const root = render();
    const { dots, buttons } = await ready(root);

    // Moving the dots outside the Slider element cuts the context path — the
    // request no longer bubbles to the provider — and nothing else changes.
    document.body.append(dots.$el);
    await settle();

    buttons[1].click();
    await frames(4);
    expect(getInstance<Slider>(root, 'Slider').currentIndex).toBe(0);
  });

  it('picks up a dot added after mount', async () => {
    const root = render({ items: 2 });
    const { slider, dots } = await ready(root);

    const added = document.createElement('button');
    added.type = 'button';
    added.setAttribute('data-ref', 'dots[]');
    added.innerHTML = '<span>3</span>';
    dots.$el.append(added);

    const item = document.createElement('div');
    item.setAttribute('data-component', 'SliderItem');
    item.style.cssText = `flex:0 0 ${ITEM_WIDTH}px;height:20px`;
    (root.querySelector('[data-ref="wrapper"]') as HTMLElement).append(item);
    await settle();

    slider.goTo(2);
    await frames(4);

    // Refs are re-queried, so the new dot is a target with no `$update()`.
    expect(added.classList.contains('is-active')).toBe(true);
    added.click();
    expect(slider.currentIndex).toBe(2);
  });
});
