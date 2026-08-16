import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Track } from './Track.js';
import { TrackContext } from './TrackContext.js';
import { TrackShopify } from './TrackShopify.js';

registerComponents(Track, TrackContext, TrackShopify);

const OFFSCREEN = 'position:absolute;top:300vh;left:0;width:50px;height:50px';
const ONSCREEN = 'position:absolute;top:0;left:0;width:50px;height:50px';

afterEach(resetDom);

beforeEach(() => {
  window.dataLayer = [];
});

async function render(html: string): Promise<HTMLElement> {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  await settle();
  return root;
}

/** Give the observer a few frames to deliver. */
async function observed(): Promise<void> {
  for (let i = 0; i < 6; i += 1) {
    await settle();
  }
}

function pushes(): Record<string, unknown>[] {
  return window.dataLayer ?? [];
}

function lastPush(): Record<string, unknown> | undefined {
  return window.dataLayer?.at(-1);
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Track — payload resolution', () => {
  it('pushes the resolved payload to window.dataLayer on click', async () => {
    const root = await render(
      `<button data-component="Track" data-track:click='{"event": "cta_click", "location": "header"}'></button>`,
    );

    root.querySelector('button')?.click();

    expect(pushes()).toHaveLength(1);
    expect(lastPush()).toEqual({ event: 'cta_click', location: 'header' });
  });

  it('treats a non-JSON attribute value as the event name', async () => {
    const root = await render(
      `<button data-component="Track" data-track:click="add_to_cart"></button>`,
    );

    root.querySelector('button')?.click();

    expect(lastPush()).toEqual({ event: 'add_to_cart' });
  });

  it('fires an event declared with an empty value, carrying the context alone', async () => {
    const root = await render(`
      <div data-component="TrackContext" data-option-context='{"page_type": "home"}'>
        <button data-component="Track" data-track:click=""></button>
      </div>
    `);

    root.querySelector('button')?.click();

    expect(lastPush()).toEqual({ page_type: 'home' });
  });

  it('uses the `payload` option as the base payload', async () => {
    const root = await render(
      `<button data-component="Track" data-track:click='{"event": "cta"}'
        data-option-payload='{"location": "header", "id": "1"}'></button>`,
    );

    root.querySelector('button')?.click();

    expect(lastPush()).toEqual({ event: 'cta', location: 'header', id: '1' });
  });

  it('lets the `payload` option override the `payload` ref, keeping the rest', async () => {
    const root = await render(`
      <button data-component="Track" data-track:click='{"event": "cta"}'
        data-option-payload='{"source": "option"}'>
        <script data-ref="payload" type="application/json">{ "source": "ref", "kept": true }</script>
      </button>
    `);

    root.querySelector('button')?.click();

    expect(lastPush()).toEqual({ event: 'cta', source: 'option', kept: true });
  });

  it('applies the precedence context < payload < per-event data', async () => {
    const root = await render(`
      <div data-component="TrackContext" data-option-context='{"value": "context", "from_context": true}'>
        <button data-component="Track" data-track:click='{"event": "x", "value": "event"}'>
          <script data-ref="payload" type="application/json">{ "value": "payload", "from_payload": true }</script>
        </button>
      </div>
    `);

    root.querySelector('button')?.click();

    expect(lastPush()).toEqual({
      value: 'event',
      from_context: true,
      from_payload: true,
      event: 'x',
    });
  });

  it('merges the whole ancestor TrackContext chain, the nearer winning', async () => {
    const root = await render(`
      <div data-component="TrackContext" data-option-context='{"page_type": "product", "currency": "EUR", "product_id": "pdp"}'>
        <div data-component="TrackContext" data-option-context='{"variant_id": "v1", "product_id": "variant"}'>
          <button data-component="Track" data-track:click='{"event": "add_to_cart"}'></button>
        </div>
      </div>
    `);

    root.querySelector('button')?.click();

    expect(lastPush()).toEqual({
      page_type: 'product',
      currency: 'EUR',
      product_id: 'variant',
      variant_id: 'v1',
      event: 'add_to_cart',
    });
  });

  it('replaces arrays on merge instead of concatenating them', async () => {
    const root = await render(`
      <div data-component="TrackContext" data-option-context='{"ecommerce": {"items": [{"id": "from-context"}]}}'>
        <button data-component="Track" data-track:click='{"event": "select_item", "ecommerce": {"items": [{"id": "from-event"}]}}'></button>
      </div>
    `);

    root.querySelector('button')?.click();

    const { ecommerce } = lastPush() as { ecommerce: { items: unknown[] } };
    expect(ecommerce.items).toEqual([{ id: 'from-event' }]);
  });

  it('never shares an array instance between two dispatches', async () => {
    const root = await render(
      `<button data-component="Track" data-track:click='{"event": "e", "items": [1, 2]}'></button>`,
    );
    const button = root.querySelector('button') as HTMLButtonElement;

    button.click();
    (lastPush() as { items: number[] }).items.push(99);
    button.click();

    expect((lastPush() as { items: number[] }).items).toEqual([1, 2]);
  });

  it('fires every data-track:* declared on one element', async () => {
    const root = await render(
      `<button data-component="Track"
        data-track:click='{"event": "click_event"}'
        data-track:mousedown='{"event": "mousedown_event"}'></button>`,
    );
    const button = root.querySelector('button') as HTMLButtonElement;

    button.dispatchEvent(new Event('mousedown'));
    button.click();

    expect(pushes().map((entry) => entry.event)).toEqual(['mousedown_event', 'click_event']);
  });
});

describe('Track — malformed declarations', () => {
  it('drops an event whose JSON cannot be parsed, without throwing', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const root = await render(
      `<button data-component="Track" data-track:click='{ not json }'></button>`,
    );

    expect(() => root.querySelector('button')?.click()).not.toThrow();
    expect(pushes()).toHaveLength(0);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('falls back to an empty payload when the `payload` ref is invalid JSON', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const root = await render(`
      <button data-component="Track" data-track:click='{"event": "x"}'>
        <script data-ref="payload" type="application/json">{ broken </script>
      </button>
    `);

    root.querySelector('button')?.click();

    expect(lastPush()).toEqual({ event: 'x' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('falls back to an empty payload when `data-option-payload` is invalid JSON', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const root = await render(
      `<button data-component="Track" data-track:click='{"event": "x"}'
        data-option-payload='{ not json }'></button>`,
    );

    expect(() => root.querySelector('button')?.click()).not.toThrow();
    expect(lastPush()).toEqual({ event: 'x' });
    spy.mockRestore();
  });
});

describe('Track — the `mounted` pseudo-event', () => {
  it('dispatches once the batch has settled, with the resolved context', async () => {
    await render(`
      <div data-component="TrackContext" data-option-context='{"page_type": "home"}'>
        <div data-component="Track" data-track:mounted='{"event": "page_view"}'></div>
      </div>
    `);
    await settle();

    expect(lastPush()).toEqual({ page_type: 'home', event: 'page_view' });
    expect(pushes()).toHaveLength(1);
  });

  it('does not dispatch when the component is destroyed before the deferred task runs', async () => {
    const root = document.createElement('div');
    root.innerHTML = `<div data-component="Track" data-track:mounted='{"event": "page_view"}'></div>`;
    document.body.append(root);
    root.innerHTML = '';
    await observed();

    expect(pushes()).toHaveLength(0);
  });

  it('applies timing modifiers to the mounted event', async () => {
    await render(
      `<div data-component="Track" data-track:mounted.debounce500='{"event": "page_view"}'></div>`,
    );
    await settle();

    expect(pushes()).toHaveLength(0);

    await wait(600);
    expect(pushes()).toHaveLength(1);
    expect(lastPush()).toEqual({ event: 'page_view' });
  });

  it('dispatches again with the new context when the component moves under a scope', async () => {
    const root = await render(
      `<div id="host"><div data-component="Track" data-track:mounted='{"event": "page_view"}'></div></div>`,
    );
    await settle();
    expect(lastPush()).toEqual({ event: 'page_view' });

    const track = root.querySelector('[data-component="Track"]') as HTMLElement;
    const scope = document.createElement('div');
    scope.setAttribute('data-component', 'TrackContext');
    scope.setAttribute('data-option-context', '{"page_type": "product"}');
    root.querySelector('#host')?.append(scope);
    scope.append(track);
    await settle();

    expect(lastPush()).toEqual({ page_type: 'product', event: 'page_view' });
  });
});

describe('Track — the `view` pseudo-event', () => {
  it('dispatches when the element enters the viewport', async () => {
    const root = await render(
      `<div data-component="Track" style="${OFFSCREEN}" data-track:view='{"event": "impression", "id": "123"}'></div>`,
    );
    await observed();
    expect(pushes()).toHaveLength(0);

    (root.firstElementChild as HTMLElement).setAttribute('style', ONSCREEN);
    await observed();

    expect(lastPush()).toEqual({ event: 'impression', id: '123' });
  });

  it('dispatches on every entry without the `.once` modifier', async () => {
    const root = await render(
      `<div data-component="Track" style="${ONSCREEN}" data-track:view='{"event": "impression"}'></div>`,
    );
    const el = root.firstElementChild as HTMLElement;
    await observed();

    el.setAttribute('style', OFFSCREEN);
    await observed();
    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(pushes()).toHaveLength(2);
  });

  it('dispatches once with the `.once` modifier and releases the subscription', async () => {
    const root = await render(
      `<div data-component="Track" style="${ONSCREEN}" data-track:view.once='{"event": "impression"}'></div>`,
    );
    const el = root.firstElementChild as HTMLElement;
    await observed();

    el.setAttribute('style', OFFSCREEN);
    await observed();
    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(pushes()).toHaveLength(1);
  });

  it('dispatches for an element taller than the viewport at the default threshold', async () => {
    await render(
      `<div data-component="Track"
        style="position:absolute;top:0;left:0;width:50px;height:400vh"
        data-track:view='{"event": "impression"}'></div>`,
    );
    await observed();

    expect(pushes()).toHaveLength(1);
  });

  /** A tall element that cannot reach its threshold never intersects. */
  it('cannot dispatch for an element that can never reach its own threshold', async () => {
    await render(
      `<div data-component="Track" data-option-threshold="0.5"
        style="position:absolute;top:0;left:0;width:50px;height:400vh"
        data-track:view='{"event": "impression"}'></div>`,
    );
    await observed();

    expect(pushes()).toHaveLength(0);
  });

  it('applies timing modifiers to the view event', async () => {
    const root = await render(
      `<div data-component="Track" style="${ONSCREEN}" data-track:view.throttle1000='{"event": "impression"}'></div>`,
    );
    const el = root.firstElementChild as HTMLElement;
    await observed();

    el.setAttribute('style', OFFSCREEN);
    await observed();
    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(pushes()).toHaveLength(1);
  });

  it('releases the observer with the mount cycle', async () => {
    const root = await render(
      `<div data-component="Track" style="${OFFSCREEN}" data-track:view='{"event": "impression"}'></div>`,
    );
    const el = root.firstElementChild as HTMLElement;
    await observed();

    const track = getInstance(el, 'Track');
    track.$destroy();
    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(pushes()).toHaveLength(0);
    expect(track.$isMounted).toBe(false);
  });
});

describe('Track — lifecycle', () => {
  it('stops dispatching a `.capture` binding after destroy and resumes on remount', async () => {
    const root = await render(
      `<div data-component="Track" data-track:click.capture='{"event": "cta"}'></div>`,
    );
    const el = root.firstElementChild as HTMLElement;
    const track = getInstance(el, 'Track');

    el.click();
    expect(pushes()).toHaveLength(1);

    track.$destroy();
    el.click();
    expect(pushes()).toHaveLength(1);

    track.$mount();
    el.click();
    expect(pushes()).toHaveLength(2);
  });

  it('cancels a pending debounced dispatch on destroy, even after a remount', async () => {
    const root = await render(
      `<div data-component="Track" data-track:input.debounce50='{"event": "search"}'></div>`,
    );
    const el = root.firstElementChild as HTMLElement;
    const track = getInstance(el, 'Track');

    el.dispatchEvent(new Event('input'));
    track.$destroy();
    track.$mount();

    await wait(150);
    expect(pushes()).toHaveLength(0);
  });

  it('re-reads the declarations on every mount cycle', async () => {
    const root = await render(
      `<div data-component="Track" data-track:click='{"event": "before"}'></div>`,
    );
    const el = root.firstElementChild as HTMLElement;
    const track = getInstance(el, 'Track');

    track.$destroy();
    el.setAttribute('data-track:click', '{"event": "after"}');
    track.$mount();
    el.click();

    expect(lastPush()).toEqual({ event: 'after' });
  });
});

describe('Track — live rebinding through watchAttributes', () => {
  it('follows a data-track:* attribute rewritten in place', async () => {
    const root = await render(
      `<div data-component="Track" data-track:click='{"event": "before"}'></div>`,
    );
    const el = root.firstElementChild as HTMLElement;

    el.setAttribute('data-track:click', '{"event": "after"}');
    await settle();
    el.click();

    expect(pushes()).toHaveLength(1);
    expect(lastPush()).toEqual({ event: 'after' });
  });

  it('releases a binding whose attribute is removed', async () => {
    const root = await render(
      `<div data-component="Track" data-track:click='{"event": "cta"}'></div>`,
    );
    const el = root.firstElementChild as HTMLElement;

    el.click();
    expect(pushes()).toHaveLength(1);

    el.removeAttribute('data-track:click');
    await settle();
    el.click();

    expect(pushes()).toHaveLength(1);
  });

  it('binds an attribute added after mount', async () => {
    const root = await render(`<div data-component="Track"></div>`);
    const el = root.firstElementChild as HTMLElement;

    el.setAttribute('data-track:click', '{"event": "late"}');
    await settle();
    el.click();

    expect(lastPush()).toEqual({ event: 'late' });
  });

  it('binds once when several attributes change in one batch', async () => {
    const root = await render(
      `<div data-component="Track" data-track:click='{"event": "a"}'></div>`,
    );
    const el = root.firstElementChild as HTMLElement;

    el.setAttribute('data-track:click', '{"event": "b"}');
    el.setAttribute('data-track:mousedown', '{"event": "c"}');
    await settle();

    el.dispatchEvent(new Event('mousedown'));
    el.click();

    expect(pushes().map((entry) => entry.event)).toEqual(['c', 'b']);
  });

  it('ends the subscription with the mount cycle', async () => {
    const root = await render(
      `<div data-component="Track" data-track:click='{"event": "cta"}'></div>`,
    );
    const el = root.firstElementChild as HTMLElement;
    const track = getInstance(el, 'Track');

    track.$destroy();
    el.setAttribute('data-track:click', '{"event": "ignored"}');
    await settle();
    el.click();

    expect(pushes()).toHaveLength(0);
  });
});

/** Count observers while always restoring the global constructor. */
async function countObservers(during: () => Promise<void>): Promise<number> {
  const Original = globalThis.IntersectionObserver;
  let built = 0;
  class Counting extends Original {
    constructor(callback: IntersectionObserverCallback, init?: IntersectionObserverInit) {
      super(callback, init);
      built += 1;
    }
  }
  globalThis.IntersectionObserver = Counting;
  try {
    await during();
  } finally {
    globalThis.IntersectionObserver = Original;
  }
  return built;
}

describe('the intersection service under load', () => {
  const CARDS = 60;

  it('gives each observed element exactly one observer, and each component its impression', async () => {
    const markup = Array.from(
      { length: CARDS },
      (_, index) =>
        `<div data-component="Track" style="${ONSCREEN};top:${index * 2}px"
          data-track:view='{"event": "impression", "id": "${index}"}'></div>`,
    ).join('');

    const built = await countObservers(async () => {
      await render(markup);
      await observed();
    });

    expect(pushes()).toHaveLength(CARDS);
    expect(new Set(pushes().map((entry) => entry.id)).size).toBe(CARDS);
    expect(built).toBe(CARDS);
  });

  it('shares one observer between two declarations on the same element', async () => {
    const built = await countObservers(async () => {
      await render(
        `<div data-component="Track" style="${ONSCREEN}"
          data-track:view='{"event": "a"}'
          data-track:view.once='{"event": "b"}'></div>`,
      );
      await observed();
    });

    expect(
      pushes()
        .map((entry) => entry.event)
        .sort(),
    ).toEqual(['a', 'b']);
    expect(built).toBe(1);
  });

  it('gives two declarations with different thresholds two observers', async () => {
    const built = await countObservers(async () => {
      await render(
        `<div data-component="Track" style="${ONSCREEN}" data-track:view='{"event": "a"}'></div>
         <div data-component="Track" style="${ONSCREEN}" data-option-threshold="0.9" data-track:view='{"event": "b"}'></div>`,
      );
      await observed();
    });

    expect(built).toBe(2);
    expect(pushes()).toHaveLength(2);
  });

  it('keys the service by the init too, so one element can be observed two ways', async () => {
    let firstRatio = -1;
    let secondRatio = -1;

    const built = await countObservers(async () => {
      const root = await render(`<div style="${ONSCREEN};height:200px" id="probe"></div>`);
      const el = root.querySelector('#probe') as HTMLElement;
      const { useInView } = await import('../../src/index.js');

      useInView(el, { threshold: 0 }).subscribe(({ entry }) => {
        firstRatio = entry?.intersectionRatio ?? -1;
      });
      useInView(el, { threshold: 0.9 }).subscribe(({ entry }) => {
        secondRatio = entry?.intersectionRatio ?? -1;
      });
      await observed();
    });

    expect(built).toBe(2);
    expect(firstRatio).toBeGreaterThan(0);
    expect(secondRatio).toBeGreaterThan(0);
  });

  it('disconnects every observer once the components are destroyed', async () => {
    const markup = Array.from(
      { length: CARDS },
      (_, index) =>
        `<div data-component="Track" style="${ONSCREEN};top:${index * 2}px"
          data-track:view.once='{"event": "impression", "id": "${index}"}'></div>`,
    ).join('');

    const root = await render(markup);
    await observed();
    expect(pushes()).toHaveLength(CARDS);

    root.remove();
    await observed();
    window.dataLayer = [];

    const built = await countObservers(async () => {
      await render(markup);
      await observed();
    });
    expect(built).toBe(CARDS);
    expect(pushes()).toHaveLength(CARDS);
  });
});

describe('TrackShopify — the dispatch seam', () => {
  it('publishes through window.Shopify.analytics.publish', async () => {
    const publish = vi.fn();
    window.Shopify = { analytics: { publish } };

    const root = await render(`
      <div data-component="TrackContext" data-option-context='{"page_type": "product"}'>
        <button data-component="TrackShopify" data-track:click='{"event": "add_to_cart", "id": "1"}'></button>
      </div>
    `);
    root.querySelector('button')?.click();

    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith('add_to_cart', {
      page_type: 'product',
      event: 'add_to_cart',
      id: '1',
    });
    expect(pushes()).toHaveLength(0);
    delete window.Shopify;
  });

  it('publishes nothing without a string `event` name', async () => {
    const publish = vi.fn();
    window.Shopify = { analytics: { publish } };
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const root = await render(
      `<button data-component="TrackShopify" data-track:click='{"id": "1"}'></button>`,
    );
    root.querySelector('button')?.click();

    expect(publish).not.toHaveBeenCalled();
    spy.mockRestore();
    delete window.Shopify;
  });

  it('does not throw when the Shopify analytics API is absent', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const root = await render(
      `<button data-component="TrackShopify" data-track:click='{"event": "x"}'></button>`,
    );

    expect(() => root.querySelector('button')?.click()).not.toThrow();
    spy.mockRestore();
  });
});
