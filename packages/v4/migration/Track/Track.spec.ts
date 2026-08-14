import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Track } from './Track.js';
import { TrackContext } from './TrackContext.js';
import { TrackShopify } from './TrackShopify.js';

/**
 * Specs for the `Track` port.
 *
 * ## How these differ from ui's
 *
 * ui's specs build instances by hand — `new Track(el)` on a detached `<div>`,
 * then `await mount(...)` — and mock the `IntersectionObserver` wholesale.
 * These render real markup into the document and let the registry mount it,
 * because that is what a v4 consumer writes, and because the `view` event runs
 * against a real observer in a real Chromium: an element is parked below the
 * fold and brought back into it, as `src/mount-strategies.spec.ts` does.
 *
 * ## Deliberately not ported
 *
 * - `should have the correct config` — `config.refs` is still asserted through
 *   the `payload` ref working; asserting the array is asserting the source.
 * - `should resolve the ancestor context only once across dispatches`, which
 *   spies on `$closest` and counts calls. The memo moved from per instance to
 *   per mount cycle, so the *assertion* changed rather than the count:
 *   `re-resolves the context when the component moves under a new scope` below
 *   asserts the property the memo is for, and would pass vacuously without one
 *   only if `$closest` were free.
 * - The two fake-timer specs (`debounce500`, `throttle200`) are re-timed
 *   against real timers with short delays, exactly as the `Action` port did:
 *   the assertion worth keeping is "ran once, late", not the timer
 *   bookkeeping.
 * - `TrackShopify`'s `$warn` specs. `$warn` does not exist in v4 (gap 10) and
 *   the port's `warn()` is a `console.warn` — asserting a log line asserts the
 *   substitution, not the component. The two *behavioural* halves of those
 *   specs (nothing published without an `event` name, nothing thrown without
 *   the API) are kept.
 */

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

    // The deferral is `defaultScheduler.background()`, the same lane eager
    // mounts queue on — so "after everything in this batch has mounted" is a
    // guarantee rather than v3's one-frame hope.
    expect(lastPush()).toEqual({ page_type: 'home', event: 'page_view' });
    expect(pushes()).toHaveLength(1);
  });

  it('does not dispatch when the component is destroyed before the deferred task runs', async () => {
    const root = document.createElement('div');
    root.innerHTML = `<div data-component="Track" data-track:mounted='{"event": "page_view"}'></div>`;
    document.body.append(root);
    // Removed inside the same task, before the background lane runs: an SPA
    // route change. The task handle is cancelled by the `mounted()` cleanup.
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

    // Wrapping existing content in a scope — what a `data-bind:if` template or
    // a `swap()` does. The element moves, so v4 destroys and remounts the same
    // instance, and both the bindings and the per-cycle context memo are
    // rebuilt. v3 memoised the context for the instance's whole life and would
    // have kept publishing the old one forever.
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

  /**
   * **This spec asserts the opposite of ui's, and the reversal is the finding.**
   *
   * ui has `should dispatch on any visibility, even a ratio below the
   * threshold (tall element)`, and `TrackEvent` carries a comment explaining
   * that it tests `isIntersecting` rather than `intersectionRatio >=
   * threshold` precisely so a tall element stays reachable.
   *
   * That reasoning only holds against ui's jsdom mock, which lets a spec force
   * `isIntersecting: true` with a ratio of `0.2`. A real `IntersectionObserver`
   * given `{ threshold: 0.5 }` reports `isIntersecting: false` until the ratio
   * crosses `0.5` — the comparison the component decided not to make is one
   * the platform makes for it, from the same option. So the component's guard
   * buys nothing, and an element taller than twice the viewport with
   * `data-option-threshold="0.5"` can never produce an impression.
   *
   * Green, not `it.fails()`: this is a bug in ui rather than a gap in v4, and
   * the port inherits it faithfully. It is recorded here because it is what
   * running a mocked spec against a real browser is for.
   */
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

    // Reference counting does this, not the component: the subscription was
    // the only one on that element's service, so the last release disconnected
    // the observer.
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

    // v3 memoised the parsed set in `__actionEvents`-style for the instance's
    // whole life; in v4 an instance survives a move, and re-insertion after a
    // `swap()` can bring different attributes on the same element.
    expect(lastPush()).toEqual({ event: 'after' });
  });
});

describe('Track — live rebinding through $watchAttributes', () => {
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

/**
 * Count the `IntersectionObserver`s built while `during` runs.
 *
 * The stub is restored in a `finally`, following `countRequestedFrames()` in
 * `src/test-utils.ts` — a stub that survives a rejected wait leaks into every
 * later file in the run.
 */
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

/**
 * The question this port was chosen to answer: does one service instance per
 * observed target hold up when many components observe many elements?
 */
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
    // One per target, and not one more. The `WeakMap` keyed by element is
    // doing exactly what `perTarget()` does for the core services.
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
    // Two `TrackEvent`s, two subscriptions, one observer — reference counting
    // rather than two `new IntersectionObserver` calls, which is what ui does.
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

    // Two elements, so two observers here whatever the key — the point of the
    // spec is the one below it, which is the case `perTarget()` gets wrong.
    expect(built).toBe(2);
    expect(pushes()).toHaveLength(2);
  });

  it('keys the service by the init too, so one element can be observed two ways', async () => {
    let firstRatio = -1;
    let secondRatio = -1;

    const built = await countObservers(async () => {
      const root = await render(`<div style="${ONSCREEN};height:200px" id="probe"></div>`);
      const el = root.querySelector('#probe') as HTMLElement;
      const { useInView } = await import('../utils/inView.js');

      useInView(el, { threshold: 0 }).subscribe(({ ratio }) => {
        firstRatio = ratio;
      });
      useInView(el, { threshold: 0.9 }).subscribe(({ ratio }) => {
        secondRatio = ratio;
      });
      await observed();
    });

    // Two observations of one element, so two observers. `perTarget()` would
    // have returned the first service to the second caller and the 0.9
    // subscriber would never have been told anything — silently.
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

    // Nothing observes anything now: every subscription left with its mount
    // cycle, and the last one out of each service disconnected its observer.
    // Rebuilding the same markup starts from zero rather than from a page
    // holding 60 stale observers.
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
    // Nothing reached the dataLayer: the seam is the only difference between
    // the two components.
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
