import { afterEach, describe, expect, it } from 'vitest';
import { BREAKPOINTS, setBreakpoints } from '../services/breakpoint.js';
import { selectorFor } from './selectors.js';

afterEach(() => setBreakpoints(BREAKPOINTS));

describe('selectorFor', () => {
  it('matches whitespace-separated data-component tokens', () => {
    const el = document.createElement('div');
    el.setAttribute('data-component', 'Action Dialog');
    expect(el.matches(selectorFor('Action'))).toBe(true);
    expect(el.matches(selectorFor('Dialog'))).toBe(true);
    expect(el.matches(selectorFor('Dia'))).toBe(false);
  });

  it('includes the exact responsive spellings from the configured breakpoint set', () => {
    setBreakpoints({ mobile: '0rem', desktop: '80rem' });
    const el = document.createElement('div');
    el.setAttribute('data-component:desktop', 'Dialog');

    expect(el.matches(selectorFor('Dialog'))).toBe(true);
  });
});
