import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { parseEventDefinition } from '../event-modifiers.js';
import { Track } from './Track.js';
import { resolveDetailPlaceholders } from './TrackEvent.js';

registerComponents(Track);

afterEach(resetDom);

beforeEach(() => {
  window.dataLayer = [];
});

async function render(html: string): Promise<HTMLElement> {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  await settle();
  return root.firstElementChild as HTMLElement;
}

function pushes(): Record<string, unknown>[] {
  return window.dataLayer ?? [];
}

function lastPush(): Record<string, unknown> | undefined {
  return window.dataLayer?.at(-1);
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('parseEventDefinition', () => {
  it('splits an event from its modifiers', () => {
    const { event, modifiers } = parseEventDefinition('click.prevent.stop');
    expect(event).toBe('click');
    expect([...modifiers]).toEqual(['prevent', 'stop']);
  });

  it('reports only the delay an author wrote, leaving the fallback to the caller', () => {
    expect(parseEventDefinition('input.debounce500').delay('debounce')).toBe(500);
    // A bare modifier carries no number, so each family keeps its own default:
    // `Track` reads 300 here and `Action` reads 100 from the same modifier.
    expect(parseEventDefinition('input.debounce').delay('debounce')).toBeUndefined();
    expect(parseEventDefinition('scroll.throttle').delay('throttle')).toBeUndefined();
    expect(parseEventDefinition('scroll.throttle200').delay('throttle')).toBe(200);
    expect(parseEventDefinition('click.prevent').delay('debounce')).toBeUndefined();
  });

  it('warns for a modifier that names nothing instead of binding it', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { event, modifiers } = parseEventDefinition('click.prevnet.stop');
    expect(event).toBe('click');
    // The typo is dropped; the modifiers that parsed still apply.
    expect([...modifiers]).toEqual(['stop']);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0].join(' ')).toContain('prevnet');
    spy.mockRestore();
  });

  it('rejects a malformed timed delay instead of parsing it to NaN', () => {
    // `debounceoops` used to match on the `debounce` prefix alone, so its
    // suffix went through `Number.parseInt` and produced `NaN` — a timeout
    // browsers run immediately rather than warn about.
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { modifiers, delay } = parseEventDefinition('click.debounceoops');
    expect([...modifiers]).toEqual([]);
    expect(delay('debounce')).toBeUndefined();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0].join(' ')).toContain('debounceoops');
    spy.mockRestore();
  });

  it('applies the family default through the bound declaration', async () => {
    const el = await render('<div data-component="Track" data-track:click.debounce></div>');
    const [trackEvent] = getInstance<Track>(el, 'Track').trackEvents;
    expect(trackEvent.debounceDelay).toBe(300);
    expect(trackEvent.throttleDelay).toBe(16);
  });
});

describe('resolveDetailPlaceholders', () => {
  it('resolves a dotted path and leaves everything else alone', () => {
    expect(
      resolveDetailPlaceholders(
        { event: 'e', email: '$detail.email', name: '$detail.user.name', kept: 1 },
        { email: 'a@b.c', user: { name: 'John' } },
      ),
    ).toEqual({ event: 'e', email: 'a@b.c', name: 'John', kept: 1 });
  });
});

describe('TrackEvent — custom events', () => {
  it('resolves `$detail.*` placeholders from the event detail', async () => {
    const el = await render(
      `<div data-component="Track" data-track:form-submitted='{"event": "form_submitted", "email": "$detail.email", "name": "$detail.user.name"}'></div>`,
    );

    el.dispatchEvent(
      new CustomEvent('form-submitted', {
        detail: { email: 'test@example.com', user: { name: 'John' } },
      }),
    );

    expect(lastPush()).toEqual({
      event: 'form_submitted',
      email: 'test@example.com',
      name: 'John',
    });
  });

  it('resolves placeholders nested inside arrays', async () => {
    const el = await render(
      `<div data-component="Track" data-track:add-to-cart='{"event": "add_to_cart", "ecommerce": {"items": [{"item_id": "$detail.id", "price": "$detail.price"}]}}'></div>`,
    );

    el.dispatchEvent(new CustomEvent('add-to-cart', { detail: { id: 'SKU1', price: 29.9 } }));

    expect(lastPush()).toEqual({
      event: 'add_to_cart',
      ecommerce: { items: [{ item_id: 'SKU1', price: 29.9 }] },
    });
  });

  it('treats a falsy detail as empty rather than leaking the literal placeholder', async () => {
    const el = await render(
      `<div data-component="Track" data-track:ping='{"event": "ping", "value": "$detail.value"}'></div>`,
    );

    el.dispatchEvent(new CustomEvent('ping', { detail: 0 }));

    const push = lastPush() as Record<string, unknown>;
    expect(push.event).toBe('ping');
    expect(push.value).toBeUndefined();
  });

  it('merges the whole detail with the `.detail` modifier', async () => {
    const el = await render(
      `<div data-component="Track" data-track:custom-event.detail='{"event": "custom"}'></div>`,
    );

    el.dispatchEvent(new CustomEvent('custom-event', { detail: { foo: 'bar', count: 2 } }));

    expect(lastPush()).toEqual({ event: 'custom', foo: 'bar', count: 2 });
  });
});

describe('TrackEvent — listener modifiers', () => {
  it('prevents the default action with `.prevent`', async () => {
    const el = await render(
      `<div data-component="Track" data-track:click.prevent='{"event": "cta"}'></div>`,
    );

    const event = new Event('click', { bubbles: true, cancelable: true });
    el.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(pushes()).toHaveLength(1);
  });

  it('stops propagation with `.stop`', async () => {
    const el = await render(
      `<div id="outer"><div data-component="Track" data-track:click.stop='{"event": "cta"}'></div></div>`,
    );
    let reachedParent = false;
    (el.parentElement as HTMLElement).addEventListener('click', () => {
      reachedParent = true;
    });

    (el.querySelector('[data-component="Track"]') as HTMLElement).dispatchEvent(
      new Event('click', { bubbles: true }),
    );

    expect(reachedParent).toBe(false);
    expect(pushes()).toHaveLength(1);
  });

  it('fires only once with `.once`', async () => {
    const el = await render(
      `<div data-component="Track" data-track:click.once='{"event": "cta"}'></div>`,
    );

    el.click();
    el.click();

    expect(pushes()).toHaveLength(1);
  });

  it('listens in the capture phase with `.capture`', async () => {
    const el = await render(
      `<div data-component="Track" data-track:click.capture='{"event": "cta"}'><span></span></div>`,
    );
    el.addEventListener('click', () => window.dataLayer?.push({ event: 'bubble' }));

    (el.querySelector('span') as HTMLElement).dispatchEvent(new Event('click', { bubbles: true }));

    expect(pushes().map((entry) => entry.event)).toEqual(['cta', 'bubble']);
  });
});

describe('TrackEvent — timing modifiers', () => {
  it('debounces, keeping only the trailing dispatch', async () => {
    const el = await render(
      `<div data-component="Track" data-track:input.debounce100='{"event": "search_input"}'></div>`,
    );

    el.dispatchEvent(new Event('input'));
    el.dispatchEvent(new Event('input'));
    el.dispatchEvent(new Event('input'));
    expect(pushes()).toHaveLength(0);

    await wait(200);
    expect(pushes()).toHaveLength(1);
    expect(lastPush()).toEqual({ event: 'search_input' });
  });

  it('throttles on the leading edge', async () => {
    const el = await render(
      `<div data-component="Track" data-track:scroll.throttle200='{"event": "scroll_depth"}'></div>`,
    );

    el.dispatchEvent(new Event('scroll'));
    expect(pushes()).toHaveLength(1);

    el.dispatchEvent(new Event('scroll'));
    el.dispatchEvent(new Event('scroll'));
    expect(pushes()).toHaveLength(1);

    await wait(250);
    el.dispatchEvent(new Event('scroll'));
    expect(pushes()).toHaveLength(2);
  });
});
