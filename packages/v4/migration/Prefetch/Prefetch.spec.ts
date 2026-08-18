import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { AbstractPrefetch } from './AbstractPrefetch.js';
import { PrefetchOnInteraction } from './PrefetchOnInteraction.js';
import { PrefetchWhenVisible } from './PrefetchWhenVisible.js';

registerComponents(AbstractPrefetch, PrefetchOnInteraction, PrefetchWhenVisible);

const OFFSCREEN = 'position:absolute;top:300vh;left:0;width:50px;height:50px';
const ONSCREEN = 'position:absolute;top:0;left:0;width:50px;height:50px';

/**
 * A URL nobody else in the suite asks for, so the shared `loadLink` dedup
 * cannot hide a bug — and one the test server really serves, because
 * `loadLink()` removes the element again when the load fails.
 */
let counter = 0;
function uniqueHref(): string {
  counter += 1;
  const url = new URL(window.location.href);
  url.hash = '';
  url.searchParams.set('prefetch', `${counter}-${Date.now()}`);
  return url.href;
}

function prefetchLinks(): HTMLLinkElement[] {
  return [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="prefetch"]')];
}

function hasPrefetchLink(href: string): boolean {
  return prefetchLinks().some((link) => link.href === href);
}

afterEach(async () => {
  for (const link of prefetchLinks()) {
    link.remove();
  }
  await resetDom();
});

async function render(html: string): Promise<HTMLElement> {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  await settle();
  return root;
}

/** Give the observer and the link a few frames. */
async function observed(): Promise<void> {
  for (let i = 0; i < 8; i += 1) {
    await settle();
  }
}

describe('AbstractPrefetch — is the URL prefetchable', () => {
  it('accepts a same-origin URL that is not the current page', async () => {
    const href = uniqueHref();
    const root = await render(`<a data-component="AbstractPrefetch" href="${href}"></a>`);
    const instance = getInstance<AbstractPrefetch>(
      root.firstElementChild as HTMLElement,
      'AbstractPrefetch',
    );

    expect(instance.isPrefetchable).toBe(true);
    expect(instance.url?.href).toBe(href);
  });

  it('refuses a cross-origin URL', async () => {
    const root = await render(
      `<a data-component="AbstractPrefetch" href="https://example.com/other"></a>`,
    );
    const instance = getInstance<AbstractPrefetch>(
      root.firstElementChild as HTMLElement,
      'AbstractPrefetch',
    );

    expect(instance.isPrefetchable).toBe(false);
  });

  it('refuses the current page', async () => {
    const root = await render(
      `<a data-component="AbstractPrefetch" href="${window.location.href}"></a>`,
    );
    const instance = getInstance<AbstractPrefetch>(
      root.firstElementChild as HTMLElement,
      'AbstractPrefetch',
    );

    expect(instance.isPrefetchable).toBe(false);
  });

  it('refuses an anchor into the current page', async () => {
    const root = await render(`<a data-component="AbstractPrefetch" href="#section"></a>`);
    const instance = getInstance<AbstractPrefetch>(
      root.firstElementChild as HTMLElement,
      'AbstractPrefetch',
    );

    expect(instance.isPrefetchable).toBe(false);
  });

  it('refuses when the `prefetch` option is off', async () => {
    const root = await render(
      `<a data-component="AbstractPrefetch" href="${uniqueHref()}" data-option-no-prefetch></a>`,
    );
    const instance = getInstance<AbstractPrefetch>(
      root.firstElementChild as HTMLElement,
      'AbstractPrefetch',
    );

    expect(instance.isPrefetchable).toBe(false);
  });

  /**
   * v3 reads `url.href` before asking whether the URL exists, so this throws
   * there. Found by running the port rather than by reading it.
   */
  it('answers for an anchor with no href instead of throwing', async () => {
    const root = await render(`<a data-component="AbstractPrefetch"></a>`);
    const instance = getInstance<AbstractPrefetch>(
      root.firstElementChild as HTMLElement,
      'AbstractPrefetch',
    );

    expect(instance.url).toBeNull();
    expect(instance.isPrefetchable).toBe(false);
    expect(() => instance.prefetch()).not.toThrow();
  });
});

describe('AbstractPrefetch — the hint', () => {
  it('appends a prefetch link for a prefetchable URL', async () => {
    const href = uniqueHref();
    const root = await render(`<a data-component="AbstractPrefetch" href="${href}"></a>`);
    const instance = getInstance<AbstractPrefetch>(
      root.firstElementChild as HTMLElement,
      'AbstractPrefetch',
    );

    instance.prefetch();
    await observed();

    expect(hasPrefetchLink(href)).toBe(true);
  });

  it('appends nothing for a URL that is not prefetchable', async () => {
    const before = prefetchLinks().length;
    const root = await render(
      `<a data-component="AbstractPrefetch" href="https://example.com/other"></a>`,
    );
    const instance = getInstance<AbstractPrefetch>(
      root.firstElementChild as HTMLElement,
      'AbstractPrefetch',
    );

    instance.prefetch();
    await observed();

    expect(prefetchLinks()).toHaveLength(before);
  });

  it('emits `prefetched` with the URL once the hint has settled', async () => {
    const href = uniqueHref();
    const root = await render(`<a data-component="AbstractPrefetch" href="${href}"></a>`);
    const instance = getInstance<AbstractPrefetch>(
      root.firstElementChild as HTMLElement,
      'AbstractPrefetch',
    );
    let detail: { url: URL } | undefined;
    document.addEventListener('prefetched', (event) => {
      detail = (event as CustomEvent<{ url: URL }>).detail;
    });

    instance.prefetch();
    await observed();

    expect(detail?.url.href).toBe(href);
  });

  /**
   * `loadLink()` deduplicates by resolved URL and `rel`, which is what v3's
   * `static prefetchedUrls` set did — one link element for two components.
   */
  it('appends one link for two components pointing at the same URL', async () => {
    const href = uniqueHref();
    const root = await render(`
      <a data-component="AbstractPrefetch" href="${href}"></a>
      <a data-component="AbstractPrefetch" href="${href}"></a>
    `);
    const [first, second] = [...root.children].map((el) =>
      getInstance<AbstractPrefetch>(el as HTMLElement, 'AbstractPrefetch'),
    );

    first.prefetch();
    second.prefetch();
    await observed();

    expect(prefetchLinks().filter((link) => link.href === href)).toHaveLength(1);
  });

  /**
   * And where v3 differs: its set makes the *second* component silent, since
   * the early return happens before anything is emitted. Sharing the link is
   * not a reason to swallow the second component's announcement.
   */
  it('still announces to the second component sharing the link', async () => {
    const href = uniqueHref();
    const root = await render(`
      <a data-component="AbstractPrefetch" href="${href}"></a>
      <a data-component="AbstractPrefetch" href="${href}"></a>
    `);
    const instances = [...root.children].map((el) =>
      getInstance<AbstractPrefetch>(el as HTMLElement, 'AbstractPrefetch'),
    );
    let count = 0;
    document.addEventListener('prefetched', () => {
      count += 1;
    });

    for (const instance of instances) {
      instance.prefetch();
    }
    await observed();

    expect(count).toBe(2);
  });

  it('says nothing once the component has been destroyed', async () => {
    const href = uniqueHref();
    const root = await render(`<a data-component="AbstractPrefetch" href="${href}"></a>`);
    const instance = getInstance<AbstractPrefetch>(
      root.firstElementChild as HTMLElement,
      'AbstractPrefetch',
    );
    let count = 0;
    document.addEventListener('prefetched', () => {
      count += 1;
    });

    instance.prefetch();
    root.remove();
    await observed();

    expect(count).toBe(0);
  });
});

describe('PrefetchOnInteraction', () => {
  it('prefetches when the pointer arrives', async () => {
    const href = uniqueHref();
    const root = await render(`<a data-component="PrefetchOnInteraction" href="${href}"></a>`);

    root.firstElementChild?.dispatchEvent(new PointerEvent('pointerenter'));
    await observed();

    expect(hasPrefetchLink(href)).toBe(true);
  });

  it('prefetches for a touch and for the keyboard, which `mouseenter` never saw', async () => {
    const tapped = uniqueHref();
    const focused = uniqueHref();
    const root = await render(
      `<a data-component="PrefetchOnInteraction" href="${tapped}"></a>` +
        `<a data-component="PrefetchOnInteraction" href="${focused}"></a>`,
    );
    const [tap, focus] = [...root.children];

    tap.dispatchEvent(new PointerEvent('pointerdown'));
    focus.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await observed();

    expect(hasPrefetchLink(tapped)).toBe(true);
    expect(hasPrefetchLink(focused)).toBe(true);
  });

  it('does not instantiate the component before the intent arrives', async () => {
    const href = uniqueHref();
    const root = await render(`<a data-component="PrefetchOnInteraction" href="${href}"></a>`);
    await observed();

    expect(
      getInstance<PrefetchOnInteraction>(
        root.firstElementChild as HTMLElement,
        'PrefetchOnInteraction',
      ),
    ).toBeUndefined();
    expect(hasPrefetchLink(href)).toBe(false);
  });

  it('inherits the `prefetch` option from the base class config', async () => {
    const href = uniqueHref();
    const root = await render(
      `<a data-component="PrefetchOnInteraction" href="${href}" data-option-no-prefetch></a>`,
    );

    root.firstElementChild?.dispatchEvent(new PointerEvent('pointerenter'));
    await observed();

    expect(hasPrefetchLink(href)).toBe(false);
  });
});

describe('PrefetchWhenVisible', () => {
  it('does not instantiate the component while the link is off screen', async () => {
    const href = uniqueHref();
    const root = await render(
      `<a data-component="PrefetchWhenVisible" href="${href}" style="${OFFSCREEN}"></a>`,
    );
    await observed();

    expect(
      getInstance<PrefetchWhenVisible>(
        root.firstElementChild as HTMLElement,
        'PrefetchWhenVisible',
      ),
    ).toBeUndefined();
    expect(hasPrefetchLink(href)).toBe(false);
  });

  it('prefetches the first time the link is seen', async () => {
    const href = uniqueHref();
    await render(`<a data-component="PrefetchWhenVisible" href="${href}" style="${ONSCREEN}"></a>`);
    await observed();

    expect(hasPrefetchLink(href)).toBe(true);
  });

  /**
   * `visible` is the one-shot strategy, so the component keeps running after
   * the link scrolls away instead of being destroyed and rebuilt as v3's
   * `withMountWhenInView` does.
   */
  it('stays mounted after the link leaves the viewport', async () => {
    const href = uniqueHref();
    const root = await render(
      `<a data-component="PrefetchWhenVisible" href="${href}" style="${ONSCREEN}"></a>`,
    );
    await observed();
    const el = root.firstElementChild as HTMLElement;
    const instance = getInstance<PrefetchWhenVisible>(el, 'PrefetchWhenVisible');
    expect(instance?.$isMounted).toBe(true);

    el.setAttribute('style', OFFSCREEN);
    await observed();

    expect(getInstance<PrefetchWhenVisible>(el, 'PrefetchWhenVisible')?.$isMounted).toBe(true);
  });

  it('appends exactly one link, however often the link crosses', async () => {
    const href = uniqueHref();
    const root = await render(
      `<a data-component="PrefetchWhenVisible" href="${href}" style="${ONSCREEN}"></a>`,
    );
    await observed();
    const el = root.firstElementChild as HTMLElement;

    el.setAttribute('style', OFFSCREEN);
    await observed();
    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(prefetchLinks().filter((link) => link.href === href)).toHaveLength(1);
  });
});
