import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { FigureShopify } from './FigureShopify.js';

registerComponents(FigureShopify);

afterEach(resetDom);

// `lazy` is left unset (defaults false on a plain Figure, but
// AbstractFigureDynamic defaults it true) so it is disabled explicitly:
// `formatSrc` is tested as a pure function, and mounting must not attempt a
// real network fetch against a fabricated CDN URL.
async function render(attributes = ''): Promise<FigureShopify> {
  const root = document.createElement('div');
  root.innerHTML = `
    <div data-component="FigureShopify" data-option-no-lazy ${attributes}>
      <img data-ref="img" style="width:100px;height:200px" data-src="https://cdn.shopify.com/shop/product.jpg" />
    </div>`;
  document.body.append(root);
  await settle();
  return getInstance<FigureShopify>(root.firstElementChild, 'FigureShopify');
}

describe('FigureShopify', () => {
  it('sizes the source to the rendered element, rounded to the step', async () => {
    const instance = await render('data-option-step="50"');

    const url = new URL(instance.formatSrc('https://cdn.shopify.com/shop/product.jpg'));

    expect(url.searchParams.get('width')).toBe(String(100 * window.devicePixelRatio));
    expect(url.searchParams.get('height')).toBe(String(200 * window.devicePixelRatio));
  });

  it('rounds a size up to the next step', async () => {
    const instance = await render('data-option-step="150"');

    const url = new URL(instance.formatSrc('https://cdn.shopify.com/shop/product.jpg'));

    // 100 -> 150, 200 -> 300, per `normalizeSize`.
    expect(url.searchParams.get('width')).toBe(String(150 * window.devicePixelRatio));
    expect(url.searchParams.get('height')).toBe(String(300 * window.devicePixelRatio));
  });

  it('sets the crop parameter when the option is given', async () => {
    const instance = await render('data-option-crop="center"');

    const url = new URL(instance.formatSrc('https://cdn.shopify.com/shop/product.jpg'));

    expect(url.searchParams.get('crop')).toBe('center');
  });

  it('omits the crop parameter by default', async () => {
    const instance = await render();

    const url = new URL(instance.formatSrc('https://cdn.shopify.com/shop/product.jpg'));

    expect(url.searchParams.has('crop')).toBe(false);
  });

  it('bypasses formatSrc when disabled', async () => {
    const instance = await render('data-option-disable');

    expect(instance.original).toBe('https://cdn.shopify.com/shop/product.jpg');
  });
});
