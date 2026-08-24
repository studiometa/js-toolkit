import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { FETCH_EVENTS } from './Fetch.js';
import { FetchShopifyPartial } from './FetchShopifyPartial.js';

registerComponents(FetchShopifyPartial);

const originalFetch = window.fetch;
const originalHref = window.location.href;
const originalLoadPartialsModule = FetchShopifyPartial.loadPartialsModule;

/** Real navigation would take the test runner with it. */
function preventNavigation(event: Event): void {
  event.preventDefault();
}

beforeEach(() => {
  document.addEventListener('click', preventNavigation, true);
});

afterEach(async () => {
  document.removeEventListener('click', preventNavigation, true);
  window.fetch = originalFetch;
  window.history.replaceState({}, '', originalHref);
  FetchShopifyPartial.loadPartialsModule = originalLoadPartialsModule;
  await resetDom();
});

async function mount(html: string): Promise<{ root: HTMLElement; instance: FetchShopifyPartial }> {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  await settle();
  const el = root.firstElementChild as HTMLElement;
  return { root, instance: getInstance<FetchShopifyPartial>(el, 'FetchShopifyPartial') };
}

function stubClient(
  respond: () => Response | Promise<Response> = () => new Response('<div id="a">base</div>'),
): ReturnType<typeof vi.fn> {
  const client = vi.fn(async () => respond());
  window.fetch = client as unknown as typeof fetch;
  return client;
}

function stubPartials(api: {
  fetch: (...args: unknown[]) => Promise<unknown>;
  apply: (update: unknown) => void | Promise<void>;
}): void {
  FetchShopifyPartial.loadPartialsModule = async () => ({ partials: api });
}

function recordEvents(root: EventTarget): Array<{ type: string; detail: unknown }> {
  const events: Array<{ type: string; detail: unknown }> = [];
  for (const type of Object.values(FETCH_EVENTS)) {
    root.addEventListener(type, (event) => {
      events.push({ type, detail: (event as CustomEvent).detail });
    });
  }
  return events;
}

describe('FetchShopifyPartial', () => {
  it('falls back to the base Fetch behaviour when no partials are configured', async () => {
    const client = stubClient();
    const { root, instance } = await mount(
      `<a data-component="FetchShopifyPartial" href="/page" id="a"><div id="a">old</div></a>`,
    );
    const events = recordEvents(root);

    await instance.fetch();
    await settle();

    expect(client).toHaveBeenCalledOnce();
    expect(events.map((e) => e.type)).toContain(FETCH_EVENTS.RESPONSE);
  });

  it('uses partial rendering when partials are configured and the module resolves', async () => {
    const client = stubClient();
    const apply = vi.fn();
    const fetchPartials = vi.fn(async () => ({ shape: 'partial-update' }));
    stubPartials({ fetch: fetchPartials, apply });
    const { root, instance } = await mount(
      `<a data-component="FetchShopifyPartial" href="/page" data-option-partials="main, header"></a>`,
    );
    const events = recordEvents(root);

    await instance.fetch();
    await settle();

    expect(client).not.toHaveBeenCalled();
    expect(fetchPartials).toHaveBeenCalledWith(
      'main',
      'header',
      expect.objectContaining({ url: expect.stringContaining('/page') }),
    );
    expect(apply).toHaveBeenCalledWith({ shape: 'partial-update' });

    const types = events.map((e) => e.type);
    expect(types).not.toContain(FETCH_EVENTS.RESPONSE);
    expect(types).toEqual([
      FETCH_EVENTS.BEFORE_FETCH,
      FETCH_EVENTS.FETCH,
      FETCH_EVENTS.AFTER_FETCH,
      FETCH_EVENTS.BEFORE_UPDATE,
      FETCH_EVENTS.UPDATE,
      FETCH_EVENTS.AFTER_UPDATE,
    ]);
    const updateEvent = events.find((e) => e.type === FETCH_EVENTS.UPDATE);
    expect(updateEvent?.detail).toMatchObject({ update: { shape: 'partial-update' } });
  });

  it('falls back to the base Fetch behaviour when the partials module fails to resolve', async () => {
    const client = stubClient();
    FetchShopifyPartial.loadPartialsModule = async () => {
      throw new Error('not installed');
    };
    const { instance } = await mount(
      `<a data-component="FetchShopifyPartial" href="/page" data-option-partials="main"><div id="a">old</div></a>`,
    );

    await instance.fetch();
    await settle();

    expect(client).toHaveBeenCalledOnce();
  });

  it('falls back to the base behaviour for a non-GET request even with partials configured', async () => {
    const client = stubClient();
    const fetchPartials = vi.fn(async () => ({}));
    stubPartials({ fetch: fetchPartials, apply: vi.fn() });
    const { instance } = await mount(
      `<a data-component="FetchShopifyPartial" href="/page" data-option-partials="main"><div id="a">old</div></a>`,
    );

    await instance.fetch(instance.url, { method: 'POST' });
    await settle();

    expect(fetchPartials).not.toHaveBeenCalled();
    expect(client).toHaveBeenCalledOnce();
  });

  it('falls back to the base behaviour for a request carrying a non-internal header', async () => {
    const client = stubClient();
    const fetchPartials = vi.fn(async () => ({}));
    stubPartials({ fetch: fetchPartials, apply: vi.fn() });
    const { instance } = await mount(
      `<a data-component="FetchShopifyPartial" href="/page" data-option-partials="main"><div id="a">old</div></a>`,
    );

    await instance.fetch(instance.url, { headers: { 'x-custom': '1' } });
    await settle();

    expect(fetchPartials).not.toHaveBeenCalled();
    expect(client).toHaveBeenCalledOnce();
  });

  it('falls back for a custom header given as a Headers instance, not only as a record', async () => {
    const client = stubClient();
    const fetchPartials = vi.fn(async () => ({}));
    stubPartials({ fetch: fetchPartials, apply: vi.fn() });
    const { instance } = await mount(
      `<a data-component="FetchShopifyPartial" href="/page" data-option-partials="main"><div id="a">old</div></a>`,
    );

    // Spreading a `Headers` yields no keys, so this used to pass the check.
    await instance.fetch(instance.url, { headers: new Headers({ 'X-Custom': '1' }) });
    await settle();

    expect(fetchPartials).not.toHaveBeenCalled();
    expect(client).toHaveBeenCalledOnce();
  });

  it('falls back for a custom header given as a list of tuples', async () => {
    const client = stubClient();
    const fetchPartials = vi.fn(async () => ({}));
    stubPartials({ fetch: fetchPartials, apply: vi.fn() });
    const { instance } = await mount(
      `<a data-component="FetchShopifyPartial" href="/page" data-option-partials="main"><div id="a">old</div></a>`,
    );

    await instance.fetch(instance.url, { headers: [['X-Custom', '1']] });
    await settle();

    expect(fetchPartials).not.toHaveBeenCalled();
    expect(client).toHaveBeenCalledOnce();
  });

  it('still uses partial rendering for an internal header given as a Headers instance', async () => {
    const client = stubClient();
    const fetchPartials = vi.fn(async () => ({}));
    stubPartials({ fetch: fetchPartials, apply: vi.fn() });
    const { instance } = await mount(
      `<a data-component="FetchShopifyPartial" href="/page" data-option-partials="main"></a>`,
    );

    await instance.fetch(instance.url, { headers: new Headers({ 'X-Requested-By': 'x' }) });
    await settle();

    expect(fetchPartials).toHaveBeenCalledOnce();
    expect(client).not.toHaveBeenCalled();
  });

  it('routes an apply() rejection through the error event instead of leaving it unhandled', async () => {
    stubClient();
    const failure = new Error('apply failed');
    stubPartials({
      fetch: async () => ({}),
      apply: () => Promise.reject(failure),
    });
    const { root, instance } = await mount(
      `<a data-component="FetchShopifyPartial" href="/page" data-option-partials="main"></a>`,
    );
    const errors: unknown[] = [];
    root.addEventListener(FETCH_EVENTS.ERROR, (event) => {
      errors.push((event as CustomEvent<{ error: unknown }>).detail.error);
    });

    await instance.fetch();
    await settle();

    expect(errors).toEqual([failure]);
  });

  it('skips the history push for a popstate header given as a Headers instance', async () => {
    stubPartials({ fetch: async () => ({}), apply: vi.fn() });
    const { instance } = await mount(
      `<a data-component="FetchShopifyPartial" href="/page" data-option-partials="main" data-option-history></a>`,
    );
    const before = window.history.length;

    // The internal header is what tells `applyPartials()` not to push; read as
    // a plain record it is invisible in this form.
    await instance.fetch(instance.url, {
      headers: new Headers({ 'x-triggered-by': 'popstate' }),
    });
    await settle();

    expect(window.history.length).toBe(before);
  });

  it('still pushes history for a request that is not popstate-triggered', async () => {
    stubPartials({ fetch: async () => ({}), apply: vi.fn() });
    const { instance } = await mount(
      `<a data-component="FetchShopifyPartial" href="/page" data-option-partials="main" data-option-history></a>`,
    );
    const before = window.history.length;

    await instance.fetch();
    await settle();

    expect(window.history.length).toBe(before + 1);
  });

  it('memoises the resolved partials module across calls', async () => {
    const loadSpy = vi.fn(async () => ({
      partials: { fetch: vi.fn(async () => ({})), apply: vi.fn() },
    }));
    FetchShopifyPartial.loadPartialsModule = loadSpy;
    const { instance } = await mount(
      `<a data-component="FetchShopifyPartial" href="/page" data-option-partials="main"></a>`,
    );

    await instance.fetch();
    await instance.fetch();

    expect(loadSpy).toHaveBeenCalledOnce();
  });
});
