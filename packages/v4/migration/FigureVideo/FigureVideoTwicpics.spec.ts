import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { FigureVideoTwicpics } from './FigureVideoTwicpics.js';

registerComponents(FigureVideoTwicpics);

afterEach(resetDom);

// `lazy` left unset (defaults false) so mounting never attempts a real
// network fetch against a fabricated CDN URL: `formatSrc` is tested as a
// pure function.
async function render(attributes = ''): Promise<FigureVideoTwicpics> {
  const root = document.createElement('div');
  root.innerHTML = `
    <div data-component="FigureVideoTwicpics" ${attributes}>
      <video data-ref="video" style="width:100px;height:200px">
        <source data-src="https://example.com/original/clip.mp4" />
      </video>
    </div>`;
  document.body.append(root);
  await settle();
  return getInstance<FigureVideoTwicpics>(root.firstElementChild, 'FigureVideoTwicpics');
}

describe('FigureVideoTwicpics', () => {
  it('builds a twic query from the measured size and the default cover mode', async () => {
    const instance = await render('data-option-step="50"');

    const url = new URL(instance.formatSrc('https://example.com/original/clip.mp4'));

    expect(url.searchParams.get('twic')).toBe('v1/cover=100x200');
  });

  it('appends extra segments after the size', async () => {
    const instance = await render('data-option-step="50"');

    const url = new URL(
      instance.formatSrc('https://example.com/original/clip.mp4', ['output=mp4']),
    );

    expect(url.searchParams.get('twic')).toBe('v1/cover=100x200/output=mp4');
  });

  it('defaults the domain to the first source host', async () => {
    const instance = await render();

    expect(instance.domain).toBe('example.com');
  });

  it('uses the domain option over the source host when given', async () => {
    const instance = await render('data-option-domain="cdn.twic.pics"');

    const url = new URL(instance.formatSrc('https://example.com/original/clip.mp4'));

    expect(url.host).toBe('cdn.twic.pics');
  });

  it('prefixes the pathname with the path option, without a doubled slash', async () => {
    const instance = await render('data-option-path="/my/base/"');

    expect(instance.path).toBe('my/base');
    const url = new URL(instance.formatSrc('https://example.com/original/clip.mp4'));
    expect(url.pathname).toBe('/my/base/original/clip.mp4');
  });
});
