import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { FigureVideo } from './FigureVideo.js';

registerComponents(FigureVideo);

afterEach(resetDom);

const OFFSCREEN = 'position:absolute;top:300vh;left:0;width:50px;height:50px';
const ONSCREEN = 'position:absolute;top:0;left:0;width:50px;height:50px';

// A real 1x1 PNG, so `loadImage()` succeeds without network access.
const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

async function observed(): Promise<void> {
  for (let i = 0; i < 6; i += 1) {
    await settle();
  }
}

function render(
  style: string,
  attributes = 'data-option-lazy="true"',
): { el: HTMLElement; video: HTMLVideoElement } {
  const root = document.createElement('div');
  root.innerHTML = `
    <div data-component="FigureVideo" style="${style}" ${attributes}>
      <video data-ref="video" data-poster="${PIXEL}">
        <source data-src="${PIXEL}" type="video/mp4" />
      </video>
    </div>`;
  document.body.append(root);
  const el = root.firstElementChild as HTMLElement;
  return { el, video: el.querySelector('[data-ref="video"]') as HTMLVideoElement };
}

/**
 * `loadSources()` waits on the real `loadeddata` event, which a data-URI
 * `<source>` may never fire in a headless browser. Dispatching it directly
 * is the same technique used elsewhere in this migration to drive a
 * component's logic without depending on real media decoding.
 */
function fireLoadedData(video: HTMLVideoElement): void {
  video.dispatchEvent(new Event('loadeddata'));
}

describe('FigureVideo', () => {
  it('loads the poster and sources once scrolled into view, emitting load', async () => {
    const { el, video } = render(OFFSCREEN);
    const events: unknown[] = [];
    el.addEventListener('load', () => events.push(1));

    await observed();
    expect(events).toEqual([]);
    expect(video.querySelector('source')?.src).toBe('');

    el.setAttribute('style', ONSCREEN);
    await settle();
    fireLoadedData(video);
    await observed();

    expect(events).toEqual([1]);
    expect(video.querySelector('source')?.src).toBe(PIXEL);
    expect(video.poster).toBe(PIXEL);
  });

  it('does not load when the `lazy` option is not set', async () => {
    const { el, video } = render(ONSCREEN, '');
    const events: unknown[] = [];
    el.addEventListener('load', () => events.push(1));

    await observed();
    fireLoadedData(video);
    await observed();

    expect(events).toEqual([]);
  });

  it('does not reload once already loaded', async () => {
    const { el, video } = render(ONSCREEN);
    await settle();
    fireLoadedData(video);
    await observed();

    const instance = getInstance<FigureVideo>(el, 'FigureVideo');
    const spy = vi.spyOn(instance, 'load');

    // A later mount cycle on the same instance — the in-view strategy can
    // trigger one — must not repeat the load.
    await instance.mounted();

    expect(spy).not.toHaveBeenCalled();
    expect(instance.hasLoaded).toBe(true);
  });

  it('warns and does not throw when the video ref is missing', async () => {
    const root = document.createElement('div');
    root.innerHTML = `<div data-component="FigureVideo" style="${ONSCREEN}" data-option-lazy="true"></div>`;
    document.body.append(root);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(observed()).resolves.toBeUndefined();

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
