import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Figure } from './Figure.js';

registerComponents(Figure);

afterEach(resetDom);

const OFFSCREEN = 'position:absolute;top:300vh;left:0;width:50px;height:50px';
const ONSCREEN = 'position:absolute;top:0;left:0;width:50px;height:50px';

// A real 1x1 transparent PNG, so `loadImage()` succeeds without network access.
const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

async function observed(): Promise<void> {
  for (let i = 0; i < 6; i += 1) {
    await settle();
  }
}

// A tiny 1x1 white pixel, distinct from PIXEL, standing in for a placeholder.
const PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

function render(
  style: string,
  attributes = 'data-option-lazy="true"',
): {
  el: HTMLElement;
  img: HTMLImageElement;
} {
  const root = document.createElement('div');
  root.innerHTML = `
    <div data-component="Figure" style="${style}" ${attributes}>
      <img data-ref="img" src="${PLACEHOLDER}" data-src="${PIXEL}" />
    </div>`;
  document.body.append(root);
  const el = root.firstElementChild as HTMLElement;
  return { el, img: el.querySelector('[data-ref="img"]') as HTMLImageElement };
}

describe('Figure (AbstractFigure)', () => {
  it('loads the data-src once scrolled into view, emitting load', async () => {
    const { el, img } = render(OFFSCREEN);
    const events: unknown[] = [];
    el.addEventListener('load', () => events.push(1));

    await observed();
    expect(events).toEqual([]);
    expect(img.src).toBe(PLACEHOLDER);

    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(events).toEqual([1]);
    expect(img.src).toBe(PIXEL);
  });

  it('does not load when the `lazy` option is not set', async () => {
    const { el } = render(ONSCREEN, '');
    const events: unknown[] = [];
    el.addEventListener('load', () => events.push(1));

    await observed();

    expect(events).toEqual([]);
  });

  it('runs the enter transition once loaded', async () => {
    const { el, img } = render(
      ONSCREEN,
      'data-option-lazy="true" data-option-enter-to="visible" data-option-enter-keep="true"',
    );

    await observed();

    expect(img.classList.contains('visible')).toBe(true);
    expect(getInstance<Figure>(el, 'Figure').state).toBe('entering');
  });
});
