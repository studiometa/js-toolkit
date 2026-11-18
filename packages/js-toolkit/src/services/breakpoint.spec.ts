import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { settle } from '../test/index.js';
import { BREAKPOINTS, getBreakpoints, setBreakpoints, useBreakpoint } from './breakpoint.js';

afterEach(() => {
  setBreakpoints(BREAKPOINTS);
});

describe('useBreakpoint', () => {
  it('answers the widest matching name, with or without a subscriber', () => {
    expect(Object.keys(BREAKPOINTS)).toContain(useBreakpoint().props().name);

    const unsubscribe = useBreakpoint().subscribe(() => {});
    expect(Object.keys(BREAKPOINTS)).toContain(useBreakpoint().props().name);
    unsubscribe();
  });

  it('delivers the current name to a subscriber that asks for it', () => {
    const late: string[] = [];
    const quiet = useBreakpoint().subscribe((props) => late.push(props.name));
    expect(late).toEqual([]);

    const seen: string[] = [];
    const unsubscribe = useBreakpoint().subscribe(({ name }) => seen.push(name), {
      immediate: true,
    });
    expect(seen).toEqual([useBreakpoint().props().name]);
    expect(late).toEqual([]);

    unsubscribe();
    quiet();
  });

  it('says nothing when a resize crosses no breakpoint', async () => {
    let calls = 0;
    const unsubscribe = useBreakpoint().subscribe(() => {
      calls += 1;
    });

    window.dispatchEvent(new Event('resize'));
    document.documentElement.style.width = '320px';
    await settle();
    document.documentElement.style.width = '';
    await settle();

    expect(calls).toBe(0);
    unsubscribe();
  });

  it('re-emits at once when the set is replaced', () => {
    const seen: string[] = [];
    const unsubscribe = useBreakpoint().subscribe(({ name }) => seen.push(name));

    setBreakpoints({ small: '0rem', large: '0rem' });
    expect(getBreakpoints()).toEqual({ small: '0rem', large: '0rem' });
    expect(seen).toEqual(['large']);
    expect(useBreakpoint().props().name).toBe('large');

    setBreakpoints({ tiny: '0rem', large: '0rem' });
    expect(seen).toEqual(['large']);

    unsubscribe();
  });

  it('stops listening when the last subscriber leaves', () => {
    const seen: string[] = [];
    const unsubscribe = useBreakpoint().subscribe(({ name }) => seen.push(name));
    unsubscribe();

    setBreakpoints({ small: '0rem', large: '0rem' });
    expect(seen).toEqual([]);
  });

  describe('when the props are read before the service hears a crossing', () => {
    const crossing = async (read: () => void) => {
      await page.viewport(400, 600);
      setBreakpoints({ narrow: '0rem', wide: '40rem' });
      const seen: string[] = [];
      const unsubscribe = useBreakpoint().subscribe(({ name }) => seen.push(name));
      window.addEventListener('resize', read);
      try {
        await page.viewport(800, 600);
        await settle();
        await page.viewport(400, 600);
        await settle();
      } finally {
        window.removeEventListener('resize', read);
        unsubscribe();
      }
      return seen;
    };

    it('still emits when a resize listener reads them', async () => {
      // `resize` runs before media-query `change` events in a rendering update.
      expect(await crossing(() => useBreakpoint().props())).toEqual(['wide', 'narrow']);
    });

    it('still emits when an older media-query listener reads them', async () => {
      await page.viewport(400, 600);
      // Created before the service builds its own lists, so it is notified first.
      const older = window.matchMedia('(min-width: 40rem)');
      const read = () => useBreakpoint().props();
      older.addEventListener('change', read);
      try {
        expect(await crossing(() => {})).toEqual(['wide', 'narrow']);
      } finally {
        older.removeEventListener('change', read);
      }
    });
  });
});
