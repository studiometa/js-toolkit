import { afterEach, describe, expect, it } from 'vitest';
import { cdp } from 'vitest/browser';
import type {} from '@vitest/browser-playwright';
import { settle } from '../test-utils.js';
import { useMediaQuery, usePrefersReducedMotion, type MediaQueryProps } from './media.js';

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

    expect(seen).toEqual([{ matches: true }]);
    unsubscribe();
  });

  it('emits on a real crossing and stops listening with its last subscriber', async () => {
    await emulateReducedMotion('no-preference');
    const service = usePrefersReducedMotion();
    expect(service.props().matches).toBe(false);

    const seen: boolean[] = [];
    let emitted!: () => void;
    const hasEmitted = new Promise<void>((resolve) => {
      emitted = resolve;
    });
    const unsubscribe = service.subscribe(({ matches }) => {
      seen.push(matches);
      emitted();
    });

    await emulateReducedMotion('reduce');
    await hasEmitted;
    expect(seen).toEqual([true]);
    expect(service.props().matches).toBe(true);

    unsubscribe();
    await emulateReducedMotion('no-preference');
    await settle();
    expect(seen).toEqual([true]);
    expect(service.props().matches).toBe(false);
  });

  it('is the same service for the named query and the query itself', () => {
    expect(usePrefersReducedMotion()).toBe(useMediaQuery('(prefers-reduced-motion: reduce)'));
  });
});
