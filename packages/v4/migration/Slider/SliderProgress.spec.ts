import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { frames, getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Slider } from './Slider.js';
import { SliderProgress } from './SliderProgress.js';

registerComponents(Slider, SliderProgress);

const ITEM_WIDTH = 100;
const BAR_WIDTH = 60;

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
    <div data-component="SliderProgress" style="width:${BAR_WIDTH}px;overflow:hidden">
      <div data-ref="progress" style="width:${BAR_WIDTH}px;height:4px"></div>
    </div>
  `;
  document.body.append(root);
  return root;
}

async function ready(root: HTMLElement) {
  await settle();
  await frames(4);
  return {
    slider: getInstance<Slider>(root, 'Slider'),
    bar: root.querySelector('[data-ref="progress"]') as HTMLElement,
  };
}

describe('SliderProgress', () => {
  it('starts fully hidden and walks to fully revealed', async () => {
    const root = render();
    const { slider, bar } = await ready(root);

    expect(bar.style.transform).toBe(`translate3d(${-BAR_WIDTH}px, 0px, 0px)`);

    slider.goTo(1);
    await frames(4);
    expect(bar.style.transform).toBe(`translate3d(${-BAR_WIDTH / 2}px, 0px, 0px)`);

    slider.goTo(2);
    await frames(4);
    expect(bar.style.transform).toBe('translate3d(0px, 0px, 0px)');
  });

  it('takes its range from the published total, not from the Slider', async () => {
    const root = render({ items: 2 });
    const { slider, bar } = await ready(root);

    slider.goTo(1);
    await frames(4);
    expect(bar.style.transform).toBe('translate3d(0px, 0px, 0px)');

    // A slide appears: the range grows, and the same index is no longer the
    // end of it. v3 read `indexMax` off the Slider instance for this.
    const added = document.createElement('div');
    added.setAttribute('data-component', 'SliderItem');
    added.style.cssText = `flex:0 0 ${ITEM_WIDTH}px;height:20px`;
    (root.querySelector('[data-ref="wrapper"]') as HTMLElement).append(added);
    await settle();
    await frames(4);

    expect(bar.style.transform).toBe(`translate3d(${-BAR_WIDTH / 2}px, 0px, 0px)`);
  });

  it('shows no progress for a single slide instead of NaN', async () => {
    const root = render({ items: 1 });
    const { bar } = await ready(root);

    // v3: `map(0, 0, 0, -60, 0)` divides by zero, writes `translate3d(NaNpx…)`
    // and the browser drops the whole declaration.
    expect(bar.style.transform).toBe('translate3d(0px, 0px, 0px)');
  });
});
