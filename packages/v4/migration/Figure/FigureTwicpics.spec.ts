import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { FigureTwicpics } from './FigureTwicpics.js';

registerComponents(FigureTwicpics);

afterEach(resetDom);

// `lazy` disabled for the same reason as the FigureShopify spec: `formatSrc`
// is a pure function under test, and mounting must not fetch a fabricated URL.
async function render(
  attributes = '',
  src = 'https://example.com/original/photo.jpg',
): Promise<FigureTwicpics> {
  const root = document.createElement('div');
  root.innerHTML = `
    <div data-component="FigureTwicpics" data-option-no-lazy ${attributes}>
      <img data-ref="img" style="width:100px;height:200px" data-src="${src}" />
    </div>`;
  document.body.append(root);
  await settle();
  return getInstance<FigureTwicpics>(root.firstElementChild, 'FigureTwicpics');
}

describe('FigureTwicpics', () => {
  it('builds a twic query from the measured size and the default cover mode', async () => {
    const instance = await render('data-option-step="50"');

    const url = new URL(instance.formatSrc('https://example.com/original/photo.jpg'));

    expect(url.searchParams.get('twic')).toBe(
      `v1/cover=${100 * window.devicePixelRatio}x${200 * window.devicePixelRatio}`,
    );
  });

  it('includes the transform ahead of the mode when given', async () => {
    const instance = await render('data-option-transform="my-transform" data-option-step="50"');

    const url = new URL(instance.formatSrc('https://example.com/original/photo.jpg'));

    expect(url.searchParams.get('twic')).toBe(
      `v1/my-transform/cover=${100 * window.devicePixelRatio}x${200 * window.devicePixelRatio}`,
    );
  });

  it('defaults the domain to the source host', async () => {
    const instance = await render();

    expect(instance.domain).toBe('example.com');
  });

  it('uses the domain option over the source host when given', async () => {
    const instance = await render('data-option-domain="cdn.twic.pics"');

    const url = new URL(instance.formatSrc('https://example.com/original/photo.jpg'));

    expect(url.host).toBe('cdn.twic.pics');
  });

  it('prefixes the pathname with the path option, without a doubled slash', async () => {
    const instance = await render('data-option-path="/my/base/"');

    expect(instance.path).toBe('my/base');
    const url = new URL(instance.formatSrc('https://example.com/original/photo.jpg'));
    expect(url.pathname).toBe('/my/base/original/photo.jpg');
  });

  it('reports device pixel ratio 1 when dpr is disabled', async () => {
    const instance = await render('data-option-no-dpr');

    expect(instance.devicePixelRatio).toBe(1);
  });

  it('reports the real device pixel ratio by default', async () => {
    const instance = await render();

    expect(instance.devicePixelRatio).toBe(window.devicePixelRatio);
  });
});
