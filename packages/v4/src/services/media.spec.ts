import { afterEach, describe, expect, it } from 'vitest';
import { cdp } from 'vitest/browser';
// `CDPSession` is an empty interface until a provider augments it: this import
// is what gives `cdp().send()` its signature.
import type {} from '@vitest/browser-playwright';
import { settle } from '../test-utils.js';
import { useMediaQuery, usePrefersReducedMotion, type MediaQueryProps } from './media.js';

/**
 * A media feature the page cannot change from the inside — the reader sets it in
 * their operating system — so it is emulated through the browser itself. This is
 * what makes the change a real one: the same event path a reader flipping the
 * preference mid-session produces, rather than a stubbed `matchMedia`.
 */
async function emulateReducedMotion(value: 'reduce' | 'no-preference'): Promise<void> {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value }],
  });
}

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { features: [] });
});

describe('useMediaQuery', () => {
  it('answers the query with or without a subscriber', () => {
    const service = useMediaQuery('(orientation: landscape)');
    // A media query is cheap to ask, so the cold read is honest — which is the
    // whole answer for a caller that only needs to branch once.
    expect(service.props().matches).toBe(window.matchMedia('(orientation: landscape)').matches);

    const unsubscribe = service.subscribe(() => {});
    expect(service.props().matches).toBe(window.matchMedia('(orientation: landscape)').matches);
    unsubscribe();
  });

  it('shares one service per query, whatever the spacing', () => {
    expect(useMediaQuery('(min-width: 30rem)')).toBe(useMediaQuery('(min-width: 30rem)'));
    expect(useMediaQuery(' (min-width: 30rem) ')).toBe(useMediaQuery('(min-width: 30rem)'));
    expect(useMediaQuery('(min-width: 30rem)')).not.toBe(useMediaQuery('(min-width: 90rem)'));
  });

  it('reports the current answer to a subscriber that asks for it', () => {
    const seen: MediaQueryProps[] = [];
    const unsubscribe = useMediaQuery('(min-width: 0px)').subscribe(
      (props) => seen.push({ ...props }),
      { immediate: true },
    );

    // Nothing has crossed, so a plain subscriber would still be waiting.
    expect(seen).toEqual([{ matches: true }]);
    unsubscribe();
  });

  it('emits on a real crossing and stops listening with its last subscriber', async () => {
    await emulateReducedMotion('no-preference');
    const service = usePrefersReducedMotion();
    expect(service.props().matches).toBe(false);

    const seen: boolean[] = [];
    // Waiting on the emit itself rather than on a predicate. `props()` reads the
    // `MediaQueryList` live — deliberately, so a caller can branch without
    // subscribing — so it reports the crossing the moment the emulation applies,
    // before the `change` event has reached anyone. `until()` resolves on
    // current props that already match, so it would resolve off that live read
    // with `seen` still empty. It passed on timing alone.
    let emitted!: () => void;
    const hasEmitted = new Promise<void>((resolve) => {
      emitted = resolve;
    });
    const unsubscribe = service.subscribe(({ matches }) => {
      seen.push(matches);
      emitted();
    });

    // The reader turns motion down mid-session, which is why this is a service
    // and not a boolean read once at load time.
    await emulateReducedMotion('reduce');
    await hasEmitted;
    expect(seen).toEqual([true]);
    expect(service.props().matches).toBe(true);

    unsubscribe();
    await emulateReducedMotion('no-preference');
    await settle();
    // Released with the last subscriber, like every other service here.
    expect(seen).toEqual([true]);
    expect(service.props().matches).toBe(false);
  });

  it('is the same service for the named query and the query itself', () => {
    expect(usePrefersReducedMotion()).toBe(useMediaQuery('(prefers-reduced-motion: reduce)'));
  });
});
