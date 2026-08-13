import { afterEach, describe, expect, it } from 'vitest';
import { settle } from '../test-utils.js';
import { BREAKPOINTS, getBreakpoints, setBreakpoints, useBreakpoint } from './breakpoint.js';

afterEach(() => {
  setBreakpoints(BREAKPOINTS);
});

describe('useBreakpoint', () => {
  it('answers the widest matching name, with or without a subscriber', () => {
    // A media query is cheap to ask, so the cold read is honest — unlike the
    // sampled sources, which only know where they stand while they run.
    expect(Object.keys(BREAKPOINTS)).toContain(useBreakpoint().props().name);

    const unsubscribe = useBreakpoint().subscribe(() => {});
    expect(Object.keys(BREAKPOINTS)).toContain(useBreakpoint().props().name);
    unsubscribe();
  });

  it('delivers the current name to a subscriber that asks for it', () => {
    const late: string[] = [];
    const quiet = useBreakpoint().subscribe((props) => late.push(props.name));
    // Nothing has been crossed, so a plain subscriber hears nothing — which is
    // right for a crossing and useless for a component that has to lay itself
    // out now.
    expect(late).toEqual([]);

    const seen: string[] = [];
    const unsubscribe = useBreakpoint().subscribe(({ name }) => seen.push(name), {
      immediate: true,
    });
    expect(seen).toEqual([useBreakpoint().props().name]);
    // Only the newcomer: the others were told nothing they did not know.
    expect(late).toEqual([]);

    unsubscribe();
    quiet();
  });

  it('says nothing when a resize crosses no breakpoint', async () => {
    let calls = 0;
    const unsubscribe = useBreakpoint().subscribe(() => {
      calls += 1;
    });

    // `matchMedia` change listeners rather than a resize: this is what makes
    // the emission a crossing instead of one per resize frame, and it is the
    // only mechanism that reports a change of the reader's font size.
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

    // Every width matches, so the widest name wins whatever the viewport is.
    setBreakpoints({ small: '0rem', large: '0rem' });
    expect(getBreakpoints()).toEqual({ small: '0rem', large: '0rem' });
    // A stale name used to survive until something unrelated resized.
    expect(seen).toEqual(['large']);
    expect(useBreakpoint().props().name).toBe('large');

    // And nothing is said when the replacement lands on the same name.
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
});
