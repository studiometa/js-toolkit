import { afterEach, describe, expect, it } from 'vitest';
import { settle } from '../test-utils.js';
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
});
