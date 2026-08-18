import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Base, registerComponents, type BaseConfig } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { LazyInclude } from './LazyInclude.js';

/** A probe, so an injected component can prove it mounted. */
class Probe extends Base {
  static config: BaseConfig = { name: 'Probe' };

  static mounts = 0;

  mounted(): void {
    Probe.mounts += 1;
  }
}

registerComponents(LazyInclude, Probe);

declare global {
  interface Window {
    __lazyScriptRuns?: number;
  }
}

const originalFetch = window.fetch;

beforeEach(() => {
  Probe.mounts = 0;
  window.__lazyScriptRuns = 0;
});

afterEach(async () => {
  window.fetch = originalFetch;
  delete window.__lazyScriptRuns;
  await resetDom();
});

/** Replace `window.fetch` with one that answers every request with `body`. */
function stubFetch(body: string, ok = true): ReturnType<typeof vi.fn> {
  const client = vi.fn(async () => new Response(body, { status: ok ? 200 : 500 }));
  window.fetch = client as unknown as typeof fetch;
  return client;
}

/** Replace `window.fetch` with one the spec resolves by hand. */
function deferFetch(): { client: ReturnType<typeof vi.fn>; resolve: (body: string) => void } {
  let release: ((body: string) => void) | undefined;
  const client = vi.fn(
    async () =>
      new Promise<Response>((resolveResponse) => {
        release = (body: string) => resolveResponse(new Response(body));
      }),
  );
  window.fetch = client as unknown as typeof fetch;
  return {
    client,
    resolve(body: string) {
      release?.(body);
    },
  };
}

/** Reject every request. */
function stubFailure(): ReturnType<typeof vi.fn> {
  const client = vi.fn(async () => {
    throw new Error('offline');
  });
  window.fetch = client as unknown as typeof fetch;
  return client;
}

async function render(html: string): Promise<HTMLElement> {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  await settle();
  return root;
}

/** A few settles, because the include lands across several microtask turns. */
async function included(): Promise<void> {
  for (let i = 0; i < 4; i += 1) {
    await settle();
  }
}

describe('LazyInclude', () => {
  it('fetches the `src` option on mount and injects the response', async () => {
    const client = stubFetch('<p>remote</p>');
    const root = await render(
      `<div data-component="LazyInclude" data-option-src="/lazy.html"></div>`,
    );
    await included();

    expect(client).toHaveBeenCalledWith('/lazy.html');
    expect(root.firstElementChild?.innerHTML.trim()).toBe('<p>remote</p>');
  });

  it('hides the `loading` ref once the content lands', async () => {
    const deferred = deferFetch();
    const root = await render(
      `<div data-component="LazyInclude" data-option-src="/lazy.html">
        <span data-ref="loading">Loading…</span>
      </div>`,
    );
    const loading = root.querySelector<HTMLElement>('[data-ref="loading"]');
    expect(loading?.style.display).toBe('');

    deferred.resolve('<p>remote</p>');
    await included();

    // The ref was hidden before the swap removed it with the rest.
    expect(loading?.style.display).toBe('none');
  });

  it('reveals the `error` ref when the request fails', async () => {
    stubFailure();
    const root = await render(
      `<div data-component="LazyInclude" data-option-src="/lazy.html">
        <span data-ref="error" style="display:none">Boom</span>
      </div>`,
    );
    await included();

    expect(root.querySelector<HTMLElement>('[data-ref="error"]')?.style.display).toBe('block');
  });

  it('emits content, then always', async () => {
    stubFetch('<p>remote</p>');
    const seen: string[] = [];
    document.addEventListener('content', () => seen.push('content'));
    document.addEventListener('always', () => seen.push('always'));

    await render(`<div data-component="LazyInclude" data-option-src="/lazy.html"></div>`);
    await included();

    expect(seen).toEqual(['content', 'always']);
  });

  it('emits always only once the content is in the DOM', async () => {
    stubFetch('<p>remote</p>');
    let contentWhenAlways: string | undefined;
    document.addEventListener('always', (event) => {
      contentWhenAlways = (event.target as HTMLElement).innerHTML;
    });

    await render(`<div data-component="LazyInclude" data-option-src="/lazy.html"></div>`);
    await included();

    // `$emit()` returns before an async listener has finished, so an `always`
    // announced from the fetch chain alone would arrive on an empty element.
    expect(contentWhenAlways).toContain('<p>remote</p>');
  });

  it('emits error, then always, when the request fails', async () => {
    stubFailure();
    const seen: string[] = [];
    document.addEventListener('error', () => seen.push('error'));
    document.addEventListener('always', () => seen.push('always'));

    await render(`<div data-component="LazyInclude" data-option-src="/lazy.html"></div>`);
    await included();

    expect(seen).toEqual(['error', 'always']);
  });

  it('carries the content on the event payload', async () => {
    stubFetch('<p>remote</p>');
    let detail: { content: string } | undefined;
    document.addEventListener('content', (event) => {
      detail = (event as CustomEvent<{ content: string }>).detail;
    });

    await render(`<div data-component="LazyInclude" data-option-src="/lazy.html"></div>`);
    await included();

    expect(detail?.content).toBe('<p>remote</p>');
  });

  it('records the load when `terminateOnLoad` is set, and stays mounted', async () => {
    const deferred = deferFetch();
    const root = await render(
      `<div data-component="LazyInclude" data-option-src="/lazy.html" data-option-terminate-on-load></div>`,
    );
    const instance = getInstance<LazyInclude>(root.firstElementChild as HTMLElement, 'LazyInclude');
    expect(instance.hasLoaded).toBe(false);

    deferred.resolve('<p>remote</p>');
    await included();

    // The component is not ended: it remembers, which is what the option
    // means and what survives the move the next spec makes.
    expect(instance.hasLoaded).toBe(true);
    expect(instance.$isTerminated).toBe(false);
    expect(instance.$isMounted).toBe(true);
  });

  it('records nothing without `terminateOnLoad`', async () => {
    const deferred = deferFetch();
    const root = await render(
      `<div data-component="LazyInclude" data-option-src="/lazy.html"></div>`,
    );
    const instance = getInstance<LazyInclude>(root.firstElementChild as HTMLElement, 'LazyInclude');

    deferred.resolve('<p>remote</p>');
    await included();

    expect(instance.hasLoaded).toBe(false);
    expect(instance.$isTerminated).toBe(false);
    expect(instance.$isMounted).toBe(true);
  });

  it('warns and fetches nothing without a `src` option', async () => {
    const client = stubFetch('<p>remote</p>');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await render(`<div data-component="LazyInclude"></div>`);
    await included();

    expect(client).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  /**
   * `swap()` runs the injected scripts and awaits the lifecycle. v3 assigns
   * `innerHTML`, which does neither.
   */
  it('runs a script that arrives with the included content', async () => {
    stubFetch('<script>window.__lazyScriptRuns = (window.__lazyScriptRuns ?? 0) + 1;</script>');

    await render(`<div data-component="LazyInclude" data-option-src="/lazy.html"></div>`);
    await included();

    expect(window.__lazyScriptRuns).toBe(1);
  });

  it('mounts a component that arrives with the included content', async () => {
    stubFetch('<span data-component="Probe"></span>');

    await render(`<div data-component="LazyInclude" data-option-src="/lazy.html"></div>`);
    await included();

    expect(Probe.mounts).toBe(1);
  });

  /**
   * A v4 move is a destroy plus a mount, and `mounted()` is where the request
   * lives, so the one-shot side effect repeats. v3 mounts once per instance
   * and does not. This is the cost, asserted rather than hidden.
   */
  it('fetches again when the element is moved, because a move remounts', async () => {
    const client = stubFetch('<p>remote</p>');
    const root = await render(
      `<div data-component="LazyInclude" data-option-src="/lazy.html"></div>`,
    );
    await included();
    expect(client).toHaveBeenCalledTimes(1);

    const other = document.createElement('section');
    document.body.append(other);
    other.append(root.firstElementChild as HTMLElement);
    await included();

    expect(client).toHaveBeenCalledTimes(2);
  });

  /**
   * Gap 35, closed by dropping `$terminate()` for a field. The instance stays
   * on its element across a move, so "already loaded" survives with it — where
   * termination detached the instance and lost the memory it was made of.
   */
  it('fetches again after a failed load, whatever `terminateOnLoad` says', async () => {
    const client = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', client);
    const root = await render(
      `<div data-component="LazyInclude" data-option-src="/lazy.html" data-option-terminate-on-load></div>`,
    );
    const el = root.firstElementChild as HTMLElement;
    await included();
    expect(getInstance<LazyInclude>(el, 'LazyInclude').hasLoaded).toBe(false);

    const other = document.createElement('section');
    document.body.append(other);
    other.append(el);
    await included();

    // A request that failed is the one worth retrying on the next mount.
    expect(client).toHaveBeenCalledTimes(2);
  });

  it('does not fetch again once `terminateOnLoad` has been honoured', async () => {
    const client = stubFetch('<p>remote</p>');
    const root = await render(
      `<div data-component="LazyInclude" data-option-src="/lazy.html" data-option-terminate-on-load></div>`,
    );
    const el = root.firstElementChild as HTMLElement;
    await included();

    const other = document.createElement('section');
    document.body.append(other);
    other.append(el);
    await included();

    expect(client).toHaveBeenCalledTimes(1);
  });
});
