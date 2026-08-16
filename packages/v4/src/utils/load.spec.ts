import { afterEach, describe, expect, it } from 'vitest';
import { loadImage, loadLink, loadScript } from './load.js';

/** A 1×1 transparent GIF, so nothing here needs the network. */
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/** Well-formed as a URL, not decodable as an image. */
const BROKEN_IMAGE = 'data:image/gif;base64,bm90LWEtZ2lm';

const decodeDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'decode');

/** Replace `decode()` for one test, and put the real one back after it. */
function mockDecode(implementation: undefined | (() => Promise<void>)): void {
  Object.defineProperty(HTMLImageElement.prototype, 'decode', {
    configurable: true,
    writable: true,
    value: implementation,
  });
}

let counter = 0;

/** A unique URL per call, so the deduplication maps never leak between tests. */
function uniqueScript(body = ''): string {
  counter += 1;
  return `data:text/javascript,${encodeURIComponent(`globalThis.__load = ${counter};${body}`)}`;
}

function uniqueStylesheet(): string {
  counter += 1;
  return `data:text/css,${encodeURIComponent(`.load-${counter} { color: red }`)}`;
}

afterEach(() => {
  if (decodeDescriptor) {
    Object.defineProperty(HTMLImageElement.prototype, 'decode', decodeDescriptor);
  }
  for (const element of document.head.querySelectorAll('script[src^="data:"], link')) {
    element.remove();
  }
});

describe('loadImage', () => {
  it('resolves with the loaded element', async () => {
    const image = await loadImage(PIXEL);

    expect(image).toBeInstanceOf(HTMLImageElement);
    expect(image.src).toBe(PIXEL);
    expect(image.naturalWidth).toBe(1);
    expect(image.naturalHeight).toBe(1);
  });

  it('never touches the document', async () => {
    const image = await loadImage(PIXEL);

    expect(image.isConnected).toBe(false);
    expect(document.querySelector('img')).toBe(null);
  });

  it('rejects with an Error naming the source', async () => {
    const promise = loadImage(BROKEN_IMAGE);

    await expect(promise).rejects.toBeInstanceOf(Error);
    await expect(promise).rejects.toThrowError(`Failed to load "${BROKEN_IMAGE}".`);
    await expect(promise).rejects.toHaveProperty('cause', expect.any(Event));
  });

  it('waits for decode() to resolve before it resolves', async () => {
    let decoded = false;
    const decode = decodeDescriptor?.value as () => Promise<void>;

    mockDecode(async function mockedDecode(this: HTMLImageElement) {
      await decode.call(this);
      decoded = true;
    });

    await loadImage(PIXEL);

    expect(decoded).toBe(true);
  });

  it('falls back to the events when decode() rejects on an image that loads', async () => {
    // What some cross-origin images do in Safari: `decode()` rejects with an
    // `EncodingError` while the load itself works.
    mockDecode(() => Promise.reject(new DOMException('mocked', 'EncodingError')));

    const image = await loadImage(PIXEL);

    expect(image.naturalWidth).toBe(1);
  });

  it('still rejects on a real failure when decode() rejects', async () => {
    mockDecode(() => Promise.reject(new DOMException('mocked', 'EncodingError')));

    await expect(loadImage(BROKEN_IMAGE)).rejects.toThrowError(`Failed to load "${BROKEN_IMAGE}".`);
  });

  it('falls back to the events when decode() is unavailable', async () => {
    mockDecode(undefined);

    const image = await loadImage(PIXEL);

    expect(image.naturalWidth).toBe(1);
    await expect(loadImage(BROKEN_IMAGE)).rejects.toThrowError('Failed to load');
  });
});

describe('loadScript', () => {
  it('appends the script to the head and resolves with it', async () => {
    const src = uniqueScript();
    const script = await loadScript(src);

    expect(script).toBeInstanceOf(HTMLScriptElement);
    expect(script.parentElement).toBe(document.head);
    expect(script.src).toBe(src);
  });

  it('sets the given attributes', async () => {
    const script = await loadScript(uniqueScript(), { type: 'module', 'data-foo': 'bar' });

    expect(script.type).toBe('module');
    expect(script.dataset.foo).toBe('bar');
  });

  it('deduplicates by resolved URL: one element, one execution', async () => {
    const src = uniqueScript('globalThis.__loadRuns = (globalThis.__loadRuns ?? 0) + 1;');

    const first = loadScript(src);
    const second = loadScript(src);

    expect(second).toBe(first);
    await Promise.all([first, second]);

    expect(
      [...document.head.querySelectorAll('script')].filter((el) => el.src === src),
    ).toHaveLength(1);
    expect((globalThis as Record<string, unknown>).__loadRuns).toBe(1);

    // A third call after the load still hands back the settled promise.
    expect(loadScript(src)).toBe(first);
  });

  it('rejects with an Error naming the source, and allows a retry', async () => {
    const src = '/__does-not-exist__/load.spec.js';
    const first = loadScript(src);

    await expect(first).rejects.toThrowError(`Failed to load "${src}".`);
    expect(document.head.querySelector(`script[src="${src}"]`)).toBe(null);

    // The failure is forgotten, so this is a new attempt rather than the
    // rejection the first call stored.
    const retried = loadScript(src);
    expect(retried).not.toBe(first);
    await expect(retried).rejects.toThrowError(`Failed to load "${src}".`);
  });
});

describe('loadLink', () => {
  it('appends the link to the head and resolves with it', async () => {
    const href = uniqueStylesheet();
    const link = await loadLink(href, { rel: 'stylesheet' });

    expect(link).toBeInstanceOf(HTMLLinkElement);
    expect(link.parentElement).toBe(document.head);
    expect(link.rel).toBe('stylesheet');
    expect(link.href).toBe(href);
  });

  it('deduplicates one rel on one href', async () => {
    const href = uniqueStylesheet();

    const first = loadLink(href, { rel: 'stylesheet' });
    expect(loadLink(href, { rel: 'stylesheet' })).toBe(first);

    await first;
    expect(
      [...document.head.querySelectorAll('link')].filter((el) => el.href === href),
    ).toHaveLength(1);
  });

  it('keys on the rel too, so two intents on one href both happen', async () => {
    const href = uniqueStylesheet();

    const stylesheet = loadLink(href, { rel: 'stylesheet' });
    const prefetch = loadLink(href, { rel: 'prefetch' });

    expect(prefetch).not.toBe(stylesheet);

    // A prefetch of a `data:` URL may settle either way, or not at all.
    prefetch.catch(() => {});
    await stylesheet;

    const links = [...document.head.querySelectorAll('link')].filter((el) => el.href === href);
    expect(links).toHaveLength(2);
    expect(links.map((link) => link.rel).sort()).toEqual(['prefetch', 'stylesheet']);
  });

  it('sets the given attributes', async () => {
    const href = uniqueStylesheet();
    const link = await loadLink(href, { rel: 'stylesheet', media: 'print', title: 'themed' });

    expect(link.media).toBe('print');
    expect(link.title).toBe('themed');
  });

  it('resolves at once on a rel the browser ignores, instead of hanging', async () => {
    const href = uniqueStylesheet();
    const relList = document.createElement('link').relList;

    expect(relList.supports('studiometa-nonsense')).toBe(false);

    let settled = false;
    const promise = loadLink(href, { rel: 'studiometa-nonsense' }).then((link) => {
      settled = true;
      return link;
    });

    // One microtask is all it may take: no event is coming.
    const link = await promise;

    expect(settled).toBe(true);
    expect(link.rel).toBe('studiometa-nonsense');
    expect(link.parentElement).toBe(document.head);
  });

  it('rejects with an Error naming the href', async () => {
    const href = '/__does-not-exist__/load.spec.css';

    await expect(loadLink(href, { rel: 'stylesheet' })).rejects.toThrowError(
      `Failed to load "${href}".`,
    );
  });
});
