import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Fetch, FETCH_EVENTS, type FetchEmits } from './Fetch.js';
import { FetchShopifySection } from './FetchShopifySection.js';

registerComponents(Fetch, FetchShopifySection);

declare global {
  interface Window {
    __fetchScriptRuns?: number;
  }
}

const originalFetch = window.fetch;
const originalHref = window.location.href;

/** Real navigation would take the test runner with it. */
function preventNavigation(event: Event): void {
  event.preventDefault();
}

beforeEach(() => {
  document.addEventListener('click', preventNavigation, true);
  document.addEventListener('submit', preventNavigation, true);
});

afterEach(async () => {
  document.removeEventListener('click', preventNavigation, true);
  document.removeEventListener('submit', preventNavigation, true);
  window.fetch = originalFetch;
  window.history.replaceState({}, '', originalHref);
  delete window.__fetchScriptRuns;
  await resetDom();
});

async function render(html: string): Promise<HTMLElement> {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  await settle();
  return root;
}

/** Mount one `Fetch` (or subclass) from markup and hand back the instance. */
async function mountFetch<T extends Fetch = Fetch>(
  html: string,
  name = 'Fetch',
): Promise<{ root: HTMLElement; instance: T }> {
  const root = await render(html);
  const el = root.firstElementChild as HTMLElement;
  return { root, instance: getInstance<T>(el, name) };
}

/** Replace `window.fetch` and record every call. */
function stubClient(
  // An id no spec renders, so a request left in flight by one spec cannot
  // land in the next one's DOM.
  respond: (url: string, init: RequestInit) => Response | Promise<Response> = () =>
    new Response('<div id="fetch-default">new</div>'),
): ReturnType<typeof vi.fn> {
  const client = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) =>
    respond(String(input), init),
  );
  window.fetch = client as unknown as typeof fetch;
  return client;
}

/** Collect every `Fetch` event dispatched under `root`, in order. */
function recordEvents(root: EventTarget): Array<{ type: string; detail: unknown }> {
  const events: Array<{ type: string; detail: unknown }> = [];
  for (const type of Object.values(FETCH_EVENTS)) {
    root.addEventListener(type, (event) => {
      events.push({ type, detail: (event as CustomEvent).detail });
    });
  }
  return events;
}

/** Take over `document.startViewTransition` and count the calls. */
function stubViewTransition(): { spy: ReturnType<typeof vi.fn>; restore: () => void } {
  const original = document.startViewTransition;
  const spy = vi.fn((callback: () => void | Promise<void>) => {
    const finished = Promise.resolve(callback()).then(() => undefined);
    return { ready: finished, finished, updateCallbackDone: finished, skipTransition() {} };
  });
  Object.defineProperty(document, 'startViewTransition', { value: spy, configurable: true });
  return {
    spy,
    restore() {
      if (original) {
        Object.defineProperty(document, 'startViewTransition', {
          value: original,
          configurable: true,
        });
      } else {
        delete (document as { startViewTransition?: unknown }).startViewTransition;
      }
    },
  };
}

describe('Fetch — request resolution', () => {
  it('reads the url of a link', async () => {
    const { instance } = await mountFetch(
      `<a data-component="Fetch" href="https://example.com/test"></a>`,
    );
    expect(instance.url.href).toBe('https://example.com/test');
  });

  it('reads the action of a form', async () => {
    const { instance } = await mountFetch(
      `<form data-component="Fetch" action="https://example.com/submit" method="post"></form>`,
    );
    expect(instance.url.href).toBe('https://example.com/submit');
  });

  it('folds the fields of a GET form onto the url', async () => {
    const { instance } = await mountFetch(
      `<form data-component="Fetch" action="https://example.com/submit" method="get">
        <input name="foo" value="bar">
      </form>`,
    );
    expect(instance.url.href).toBe('https://example.com/submit?foo=bar');
  });

  it('falls back to the `src` option on an element that is neither', async () => {
    const { instance } = await mountFetch(
      `<div data-component="Fetch" data-option-src="/src-path"></div>`,
    );
    expect(instance.url.pathname).toBe('/src-path');
  });

  it('lets the `src` option win over a link href', async () => {
    const { instance } = await mountFetch(
      `<a data-component="Fetch" href="https://example.com/href" data-option-src="https://example.com/src"></a>`,
    );
    expect(instance.url.href).toBe('https://example.com/src');
  });

  it('keeps a fixed query in `src` alongside the live GET form fields', async () => {
    const { instance } = await mountFetch(
      `<form data-component="Fetch" action="https://example.com/action" method="get"
        data-option-src="https://example.com/base?section_id=header">
        <input name="foo" value="bar">
      </form>`,
    );
    expect(instance.url.searchParams.get('section_id')).toBe('header');
    expect(instance.url.searchParams.get('foo')).toBe('bar');
  });

  it('lets a GET form field win over a conflicting `src` query', async () => {
    const { instance } = await mountFetch(
      `<form data-component="Fetch" action="https://example.com/action" method="get"
        data-option-src="https://example.com/base?foo=from-src">
        <input name="foo" value="from-form">
      </form>`,
    );
    expect(instance.url.searchParams.get('foo')).toBe('from-form');
  });

  it('merges the `headers` option, the `requestInit` option and the header refs', async () => {
    const { instance } = await mountFetch(
      `<a data-component="Fetch" href="https://example.com"
        data-option-request-init='{"headers":{"x-from-init":"init"},"credentials":"include"}'
        data-option-headers='{"x-from-headers":"headers"}'>
        <input type="hidden" data-ref="headers[]" data-name="x-from-ref" value="ref">
        <input type="hidden" data-ref="headers[]" data-name="x-empty" value="">
      </a>`,
    );

    const headers = instance.requestInit.headers as Record<string, string>;
    expect(headers['x-from-init']).toBe('init');
    expect(headers['x-from-headers']).toBe('headers');
    expect(headers['x-from-ref']).toBe('ref');
    expect(headers['x-empty']).toBeUndefined();
    expect(headers['user-agent']).toContain('@studiometa/ui/Fetch');
    expect(instance.requestInit.credentials).toBe('include');
  });

  it('sends the form data as the body of a POST form', async () => {
    const { instance } = await mountFetch(
      `<form data-component="Fetch" action="https://example.com" method="post">
        <input name="foo" value="bar">
      </form>`,
    );
    expect(instance.requestInit.method).toBe('post');
    expect(instance.requestInit.body).toBeInstanceOf(FormData);
  });

  it('sends no body for a GET form', async () => {
    const { instance } = await mountFetch(
      `<form data-component="Fetch" action="https://example.com" method="get">
        <input name="foo" value="bar">
      </form>`,
    );
    expect(instance.requestInit.method).toBe('get');
    expect(instance.requestInit.body).toBeUndefined();
  });

  it('answers `isLink` and `isForm` from the element itself', async () => {
    const { instance: link } = await mountFetch(`<a data-component="Fetch" href="#a"></a>`);
    const { instance: form } = await mountFetch(`<form data-component="Fetch"></form>`);
    const { instance: div } = await mountFetch(`<div data-component="Fetch"></div>`);

    expect([link.isLink, link.isForm]).toEqual([true, false]);
    expect([form.isLink, form.isForm]).toEqual([false, true]);
    expect([div.isLink, div.isForm]).toEqual([false, false]);
  });
});

describe('Fetch — declarative triggers', () => {
  it('fetches on a plain left click of a link', async () => {
    const client = stubClient();
    const { root } = await mountFetch(`<a data-component="Fetch" href="#target"></a>`);

    root.querySelector('a')?.click();
    await settle();

    expect(client).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['ctrlKey', { ctrlKey: true }],
    ['shiftKey', { shiftKey: true }],
    ['altKey', { altKey: true }],
    ['metaKey', { metaKey: true }],
    ['a secondary button', { button: 1 }],
  ])('does not fetch on a click with %s', async (_label, init) => {
    const client = stubClient();
    const { root } = await mountFetch(`<a data-component="Fetch" href="#target"></a>`);

    root
      .querySelector('a')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }));
    await settle();

    expect(client).not.toHaveBeenCalled();
  });

  it('does not fetch on a link that opens a new tab', async () => {
    const client = stubClient();
    const { root } = await mountFetch(
      `<a data-component="Fetch" href="#target" target="_blank"></a>`,
    );

    root.querySelector('a')?.click();
    await settle();

    expect(client).not.toHaveBeenCalled();
  });

  it('does nothing on a click when the element is not a link', async () => {
    const client = stubClient();
    const { root } = await mountFetch(`<div data-component="Fetch"></div>`);

    root.querySelector('div')?.click();
    await settle();

    expect(client).not.toHaveBeenCalled();
  });

  it('fetches on a form submission', async () => {
    const client = stubClient();
    const { root } = await mountFetch(
      `<form data-component="Fetch" action="#target" method="get"></form>`,
    );

    root.querySelector('form')?.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    await settle();

    expect(client).toHaveBeenCalledTimes(1);
  });

  it('does not fetch on a form that targets a new tab', async () => {
    const client = stubClient();
    const { root } = await mountFetch(
      `<form data-component="Fetch" action="#target" method="get" target="_blank"></form>`,
    );

    root.querySelector('form')?.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    await settle();

    expect(client).not.toHaveBeenCalled();
  });

  /**
   * `onWindowPopstate` is gap 15 consumed: `popstate` only ever fires on
   * `window`, so no amount of delegation reaches it.
   */
  it('fetches the current location on popstate when history is enabled', async () => {
    const client = stubClient();
    await mountFetch(`<a data-component="Fetch" href="#target" data-option-history></a>`);

    window.dispatchEvent(new PopStateEvent('popstate'));
    await settle();

    expect(client).toHaveBeenCalledTimes(1);
    const [, init] = client.mock.calls[0] as [URL, RequestInit];
    expect((init.headers as Record<string, string>)['x-triggered-by']).toBe('popstate');
  });

  it('ignores popstate when history is disabled', async () => {
    const client = stubClient();
    await mountFetch(`<a data-component="Fetch" href="#target"></a>`);

    window.dispatchEvent(new PopStateEvent('popstate'));
    await settle();

    expect(client).not.toHaveBeenCalled();
  });

  it('stops listening to popstate once the element leaves the DOM', async () => {
    const client = stubClient();
    const { root } = await mountFetch(
      `<a data-component="Fetch" href="#target" data-option-history></a>`,
    );

    root.remove();
    await settle();
    window.dispatchEvent(new PopStateEvent('popstate'));
    await settle();

    expect(client).not.toHaveBeenCalled();
  });
});

describe('Fetch — the request', () => {
  it('defaults to the `url` getter when called bare', async () => {
    const client = stubClient();
    const { instance } = await mountFetch(
      `<a data-component="Fetch" href="https://example.com/bare"></a>`,
    );

    await instance.fetch();

    expect(String(client.mock.calls[0][0])).toBe('https://example.com/bare');
  });

  it('coerces a string url against the current location', async () => {
    const client = stubClient();
    const { instance } = await mountFetch(`<a data-component="Fetch" href="#a"></a>`);

    await instance.fetch('/relative');

    expect(String(client.mock.calls[0][0])).toBe(new URL('/relative', window.location.href).href);
  });

  it('emits the whole lifecycle in order', async () => {
    stubClient();
    const { root, instance } = await mountFetch(
      `<a data-component="Fetch" href="#a" data-option-no-view-transition></a>`,
    );
    const events = recordEvents(root);

    await instance.fetch();
    await settle();

    expect(events.map(({ type }) => type)).toEqual([
      FETCH_EVENTS.BEFORE_FETCH,
      FETCH_EVENTS.FETCH,
      FETCH_EVENTS.RESPONSE,
      FETCH_EVENTS.AFTER_FETCH,
      FETCH_EVENTS.BEFORE_UPDATE,
      FETCH_EVENTS.UPDATE,
      FETCH_EVENTS.AFTER_UPDATE,
    ]);
  });

  /**
   * v3 overrides `$emit()` to rebuild every event as a bubbling `CustomEvent`.
   * v4's `$emit()` already bubbles, so the override is deleted outright.
   */
  it('bubbles its events to an ancestor with no `$emit` override', async () => {
    stubClient();
    const { instance } = await mountFetch(`<a data-component="Fetch" href="#a"></a>`);
    const seen: string[] = [];
    document.addEventListener(FETCH_EVENTS.RESPONSE, () => seen.push('document'));

    await instance.fetch();

    expect(seen).toEqual(['document']);
  });

  it('carries a typed payload on its events', async () => {
    stubClient();
    const { root, instance } = await mountFetch(`<a data-component="Fetch" href="#a"></a>`);
    let detail: FetchEmits['fetch-response'] | undefined;
    root.addEventListener(FETCH_EVENTS.RESPONSE, (event) => {
      detail = (event as CustomEvent<FetchEmits['fetch-response']>).detail;
    });

    await instance.fetch();

    expect(detail?.instance).toBe(instance);
    expect(detail?.response).toBeInstanceOf(Response);
    expect(detail?.url).toBeInstanceOf(URL);
  });

  it('aborts the request in flight when a new one starts', async () => {
    let release: (() => void) | undefined;
    stubClient(
      async () =>
        new Promise<Response>((resolve) => {
          release = () => resolve(new Response('<div id="fetch-default">new</div>'));
        }),
    );
    const { root, instance } = await mountFetch(`<a data-component="Fetch" href="#a"></a>`);
    const events = recordEvents(root);

    void instance.fetch();
    await settle();
    void instance.fetch();
    release?.();
    await settle();

    expect(events.filter(({ type }) => type === FETCH_EVENTS.ABORT)).toHaveLength(1);
  });

  it('emits `fetch-abort` when `abort()` is called', async () => {
    stubClient(async () => new Promise<Response>(() => {}));
    const { root, instance } = await mountFetch(`<a data-component="Fetch" href="#a"></a>`);
    const events = recordEvents(root);

    void instance.fetch();
    instance.abort('because');
    await settle();

    const abort = events.find(({ type }) => type === FETCH_EVENTS.ABORT);
    expect((abort as { detail: { reason: unknown } }).detail.reason).toBe('because');
  });

  it('evaluates the `response` option to extract the content', async () => {
    stubClient(async () => new Response(JSON.stringify({ html: '<div id="target">json</div>' })));
    await render(`<div id="target">old</div>`);
    const { instance } = await mountFetch(
      `<a data-component="Fetch" href="#a" data-option-no-view-transition
        data-option-response="response.json().then((data) => data.html)"></a>`,
    );

    await instance.fetch();
    await settle();

    expect(document.getElementById('target')?.textContent).toBe('json');
  });

  it('emits `fetch-error` when the response is not ok', async () => {
    stubClient(async () => new Response('nope', { status: 500 }));
    const { root, instance } = await mountFetch(`<a data-component="Fetch" href="#a"></a>`);
    const events = recordEvents(root);

    await instance.fetch();

    const error = events.find(({ type }) => type === FETCH_EVENTS.ERROR);
    expect((error as { detail: { error: Error } }).detail.error.message).toContain('500');
  });

  it('emits `fetch-after` with the error and no content when the request fails', async () => {
    stubClient(async () => {
      throw new Error('network down');
    });
    const { root, instance } = await mountFetch(`<a data-component="Fetch" href="#a"></a>`);
    const events = recordEvents(root);

    await instance.fetch();

    const after = events.find(({ type }) => type === FETCH_EVENTS.AFTER_FETCH);
    expect((after as { detail: { error: Error } }).detail.error.message).toBe('network down');
  });
});

describe('Fetch — the DOM update', () => {
  it('replaces the matching element and leaves the rest alone', async () => {
    await render(`<div id="target">old</div><div id="untouched">keep</div>`);
    const { instance } = await mountFetch(`<a data-component="Fetch" href="#a"></a>`);

    await instance.update(
      new URL('https://example.com'),
      {},
      '<div id="target">new</div><div id="absent">nope</div>',
    );

    expect(document.getElementById('target')?.textContent).toBe('new');
    expect(document.getElementById('untouched')?.textContent).toBe('keep');
    expect(document.getElementById('absent')).toBeNull();
  });

  it('honours the `selector` option', async () => {
    await render(`<div id="target">old</div><section id="section">old</section>`);
    const { instance } = await mountFetch(
      `<a data-component="Fetch" href="#a" data-option-selector="section[id]"></a>`,
    );

    await instance.update(
      new URL('https://example.com'),
      {},
      '<div id="target">new</div><section id="section">new</section>',
    );

    expect(document.getElementById('target')?.textContent).toBe('old');
    expect(document.getElementById('section')?.textContent).toBe('new');
  });

  it('appends in `append` mode', async () => {
    await render(`<div id="target">old</div>`);
    const { instance } = await mountFetch(
      `<a data-component="Fetch" href="#a" data-option-mode="append"></a>`,
    );

    await instance.update(new URL('https://example.com'), {}, '<div id="target">new</div>');

    expect(document.getElementById('target')?.textContent).toBe('oldnew');
  });

  it('prepends in `prepend` mode', async () => {
    await render(`<div id="target">old</div>`);
    const { instance } = await mountFetch(
      `<a data-component="Fetch" href="#a" data-option-mode="prepend"></a>`,
    );

    await instance.update(new URL('https://example.com'), {}, '<div id="target">new</div>');

    expect(document.getElementById('target')?.textContent).toBe('newold');
  });

  /**
   * `morph` keeps the node and updates its attributes. Core's `swap()` morphs
   * with `childrenOnly`, which is why this port keeps its own update path.
   */
  it('keeps the node and updates its attributes in `morph` mode', async () => {
    await render(`<div id="target" class="old">old</div>`);
    const before = document.getElementById('target');
    const { instance } = await mountFetch(
      `<a data-component="Fetch" href="#a" data-option-mode="morph"></a>`,
    );

    await instance.update(
      new URL('https://example.com'),
      {},
      '<div id="target" class="new">new</div>',
    );

    expect(document.getElementById('target')).toBe(before);
    expect(before?.className).toBe('new');
    expect(before?.textContent).toBe('new');
  });

  it('replaces the element itself in `replace` mode, attributes included', async () => {
    await render(`<div id="target" class="old">old</div>`);
    const before = document.getElementById('target');
    const { instance } = await mountFetch(`<a data-component="Fetch" href="#a"></a>`);

    await instance.update(
      new URL('https://example.com'),
      {},
      '<div id="target" class="new">new</div>',
    );

    expect(document.getElementById('target')).not.toBe(before);
    expect(document.getElementById('target')?.className).toBe('new');
  });

  it('runs an injected script exactly once and leaves the surviving ones alone', async () => {
    window.__fetchScriptRuns = 0;
    await render(
      `<div id="target"><script id="kept">window.__fetchScriptRuns = (window.__fetchScriptRuns ?? 0) + 1;</script></div>`,
    );
    const runsAfterInitialParse = window.__fetchScriptRuns;
    const { instance } = await mountFetch(
      `<a data-component="Fetch" href="#a" data-option-mode="append"></a>`,
    );

    await instance.update(
      new URL('https://example.com'),
      {},
      '<div id="target"><script>window.__fetchScriptRuns = (window.__fetchScriptRuns ?? 0) + 1;</scr' +
        'ipt></div>',
    );

    expect(window.__fetchScriptRuns).toBe((runsAfterInitialParse ?? 0) + 1);
  });

  it('pushes history and adopts the response title when `history` is enabled', async () => {
    await render(`<div id="target">old</div>`);
    const { instance } = await mountFetch(
      `<a data-component="Fetch" href="#a" data-option-history></a>`,
    );

    await instance.update(
      new URL('https://example.com/pushed?q=1'),
      {},
      '<html><head><title>New title</title></head><body><div id="target">new</div></body></html>',
    );
    await settle();

    expect(window.location.pathname).toBe('/pushed');
    expect(window.location.search).toBe('?q=1');
    expect(document.title).toBe('New title');
  });

  it('does not push history for an update triggered by popstate', async () => {
    await render(`<div id="target">old</div>`);
    const { instance } = await mountFetch(
      `<a data-component="Fetch" href="#a" data-option-history></a>`,
    );
    const before = window.location.href;

    await instance.update(
      new URL('https://example.com/never-pushed'),
      { headers: { 'x-triggered-by': 'popstate' } },
      '<div id="target">new</div>',
    );

    expect(window.location.href).toBe(before);
  });

  it('mounts a component that arrives in the fetched content, with no `$update()`', async () => {
    await render(`<div id="target"></div>`);
    const { instance } = await mountFetch(`<a data-component="Fetch" href="#a"></a>`);

    await instance.update(
      new URL('https://example.com'),
      {},
      '<div id="target"><a data-component="Fetch" href="https://example.com/inner"></a></div>',
    );
    await settle();

    const injected = document.querySelector('#target [data-component="Fetch"]');
    expect(getInstance<Fetch>(injected as HTMLElement, 'Fetch')?.$isMounted).toBe(true);
  });
});

describe('Fetch — the dom-update negotiation', () => {
  it('runs the update inside a view transition by default', async () => {
    const { spy, restore } = stubViewTransition();
    await render(`<div id="target">old</div>`);
    const { instance } = await mountFetch(`<a data-component="Fetch" href="#a"></a>`);

    await instance.update(new URL('https://example.com'), {}, '<div id="target">new</div>');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(document.getElementById('target')?.textContent).toBe('new');
    restore();
  });

  it('skips the view transition when the option is off', async () => {
    const { spy, restore } = stubViewTransition();
    await render(`<div id="target">old</div>`);
    const { instance } = await mountFetch(
      `<a data-component="Fetch" href="#a" data-option-no-view-transition></a>`,
    );

    await instance.update(new URL('https://example.com'), {}, '<div id="target">new</div>');

    expect(spy).not.toHaveBeenCalled();
    expect(document.getElementById('target')?.textContent).toBe('new');
    restore();
  });

  it('batches two simultaneous updates into one view transition', async () => {
    const { spy, restore } = stubViewTransition();
    await render(`<div id="one">old</div><div id="two">old</div>`);
    const { instance: a } = await mountFetch(`<a data-component="Fetch" href="#a"></a>`);
    const { instance: b } = await mountFetch(`<a data-component="Fetch" href="#b"></a>`);

    await Promise.all([
      a.update(new URL('https://example.com'), {}, '<div id="one">new</div>'),
      b.update(new URL('https://example.com'), {}, '<div id="two">new</div>'),
    ]);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(document.getElementById('one')?.textContent).toBe('new');
    expect(document.getElementById('two')?.textContent).toBe('new');
    restore();
  });

  /**
   * The component's own view transition is registered as the first `wrap()`
   * claim, so a listener above it wins without the component asking.
   */
  it('lets an ancestor `wrap()` runner replace the default view transition', async () => {
    const { spy, restore } = stubViewTransition();
    await render(`<div id="target">old</div>`);
    const { root, instance } = await mountFetch(`<a data-component="Fetch" href="#a"></a>`);
    const order: string[] = [];
    root.addEventListener('js-toolkit:dom:update', (event) => {
      (event as CustomEvent<{ wrap(runner: (apply: () => void) => void): void }>).detail.wrap(
        (apply) => {
          order.push('runner');
          apply();
        },
      );
    });

    await instance.update(new URL('https://example.com'), {}, '<div id="target">new</div>');

    expect(order).toEqual(['runner']);
    expect(spy).not.toHaveBeenCalled();
    expect(document.getElementById('target')?.textContent).toBe('new');
    restore();
  });

  it('accepts a transitioner object exposing `update()`', async () => {
    await render(`<div id="target">old</div>`);
    const { root, instance } = await mountFetch(
      `<a data-component="Fetch" href="#a" data-option-no-view-transition></a>`,
    );
    const transitioner = { update: vi.fn((mutate: () => void) => mutate()) };
    root.addEventListener('js-toolkit:dom:update', (event) => {
      (event as CustomEvent<{ wrap(runner: unknown): void }>).detail.wrap(transitioner);
    });

    await instance.update(new URL('https://example.com'), {}, '<div id="target">new</div>');

    expect(transitioner.update).toHaveBeenCalledTimes(1);
    expect(document.getElementById('target')?.textContent).toBe('new');
  });

  it('applies the change anyway when a runner settles without applying it', async () => {
    await render(`<div id="target">old</div>`);
    const { root, instance } = await mountFetch(
      `<a data-component="Fetch" href="#a" data-option-no-view-transition></a>`,
    );
    root.addEventListener('js-toolkit:dom:update', (event) => {
      (event as CustomEvent<{ wrap(runner: () => void): void }>).detail.wrap(() => {});
    });

    await instance.update(new URL('https://example.com'), {}, '<div id="target">new</div>');

    expect(document.getElementById('target')?.textContent).toBe('new');
  });

  it('stops claiming the protocol once the update has finished', async () => {
    const { spy, restore } = stubViewTransition();
    await render(`<div id="target">old</div>`);
    const { instance } = await mountFetch(`<a data-component="Fetch" href="#a"></a>`);

    await instance.update(new URL('https://example.com'), {}, '<div id="target">new</div>');
    const callsAfterUpdate = spy.mock.calls.length;

    // A second, unrelated announcement on the same element must not be claimed.
    let claimed = false;
    instance.$el.dispatchEvent(
      new CustomEvent('js-toolkit:dom:update', {
        bubbles: true,
        detail: {
          wrap() {
            claimed = true;
          },
        },
      }),
    );

    expect(claimed).toBe(false);
    expect(spy.mock.calls).toHaveLength(callsAfterUpdate);
    restore();
  });
});

describe('FetchShopifySection', () => {
  it('inherits the whole base config along the prototype chain', async () => {
    const { instance } = await mountFetch<FetchShopifySection>(
      `<a data-component="FetchShopifySection" href="#a"></a>`,
      'FetchShopifySection',
    );

    // The static declares only `name` and `sections`; the rest is merged.
    expect(Object.keys(FetchShopifySection.config.options ?? {})).toEqual(['sections']);
    expect(instance.$config.name).toBe('FetchShopifySection');
    expect(instance.$config.options).toHaveProperty('selector');
    expect(instance.$config.options).toHaveProperty('mode');
    expect(instance.$config.options).toHaveProperty('sections');
    expect(instance.$config.refs).toEqual(['headers[]']);
    expect(instance.$options.selector).toBe('[id]');
  });

  it('appends the sections parameter without touching the href', async () => {
    const { instance } = await mountFetch<FetchShopifySection>(
      `<a data-component="FetchShopifySection" href="https://example.com/collections/all"
        data-option-sections="header, footer"></a>`,
      'FetchShopifySection',
    );

    expect(instance.url.searchParams.get('sections')).toBe('header,footer');
    expect((instance.$el as HTMLAnchorElement).href).toBe('https://example.com/collections/all');
  });

  it('trims the comma-separated list and drops empty entries', async () => {
    const { instance } = await mountFetch<FetchShopifySection>(
      `<a data-component="FetchShopifySection" href="https://example.com"
        data-option-sections=" header , , footer "></a>`,
      'FetchShopifySection',
    );

    expect(instance.sectionIds).toEqual(['header', 'footer']);
  });

  it('unwraps the JSON response and swaps each section by id', async () => {
    stubClient(
      async () =>
        new Response(
          JSON.stringify({
            header: '<div id="header">new header</div>',
            footer: '<div id="footer">new footer</div>',
          }),
        ),
    );
    await render(`<div id="header">old header</div><div id="footer">old footer</div>`);
    const { instance } = await mountFetch<FetchShopifySection>(
      `<a data-component="FetchShopifySection" href="#a" data-option-sections="header,footer"
        data-option-no-view-transition></a>`,
      'FetchShopifySection',
    );

    await instance.fetch();
    await settle();

    expect(document.getElementById('header')?.textContent).toBe('new header');
    expect(document.getElementById('footer')?.textContent).toBe('new footer');
  });

  it('drops sections returned as null', async () => {
    stubClient(
      async () =>
        new Response(JSON.stringify({ header: '<div id="header">new</div>', footer: null })),
    );
    await render(`<div id="header">old</div><div id="footer">old</div>`);
    const { instance } = await mountFetch<FetchShopifySection>(
      `<a data-component="FetchShopifySection" href="#a" data-option-sections="header,footer"
        data-option-no-view-transition></a>`,
      'FetchShopifySection',
    );

    await instance.fetch();
    await settle();

    expect(document.getElementById('header')?.textContent).toBe('new');
    expect(document.getElementById('footer')?.textContent).toBe('old');
  });

  it('degrades to the base text response when no sections are configured', async () => {
    stubClient(async () => new Response('<div id="target">plain html</div>'));
    await render(`<div id="target">old</div>`);
    const { instance } = await mountFetch<FetchShopifySection>(
      `<a data-component="FetchShopifySection" href="#a" data-option-no-view-transition></a>`,
      'FetchShopifySection',
    );

    await instance.fetch();
    await settle();

    expect(instance.url.searchParams.has('sections')).toBe(false);
    expect(document.getElementById('target')?.textContent).toBe('plain html');
  });

  it('honours a custom `response` option instead of unwrapping the JSON', async () => {
    stubClient(async () => new Response(JSON.stringify({ html: '<div id="target">custom</div>' })));
    await render(`<div id="target">old</div>`);
    const { instance } = await mountFetch<FetchShopifySection>(
      `<a data-component="FetchShopifySection" href="#a" data-option-sections="header"
        data-option-no-view-transition
        data-option-response="response.json().then((data) => data.html)"></a>`,
      'FetchShopifySection',
    );

    await instance.fetch();
    await settle();

    expect(document.getElementById('target')?.textContent).toBe('custom');
  });

  it('re-appends the sections parameter on popstate', async () => {
    const client = stubClient(async () => new Response(JSON.stringify({})));
    await mountFetch<FetchShopifySection>(
      `<a data-component="FetchShopifySection" href="#a" data-option-sections="header"
        data-option-history></a>`,
      'FetchShopifySection',
    );

    window.dispatchEvent(new PopStateEvent('popstate'));
    await settle();

    expect(String(client.mock.calls[0][0])).toContain('sections=header');
  });

  it('keeps the sections parameter out of the pushed url', async () => {
    await render(`<div id="target">old</div>`);
    const { instance } = await mountFetch<FetchShopifySection>(
      `<a data-component="FetchShopifySection" href="#a" data-option-sections="header"
        data-option-history></a>`,
      'FetchShopifySection',
    );

    await instance.update(
      new URL('https://example.com/pushed?sections=header&q=1'),
      {},
      '<div id="target">new</div>',
    );

    expect(window.location.search).toBe('?q=1');
  });
});
