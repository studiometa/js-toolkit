import { describe, expect, it } from 'vitest';
import { selectorFor } from './selectors.js';

describe('selectorFor', () => {
  it('matches whitespace-separated data-component tokens', () => {
    const el = document.createElement('div');
    el.setAttribute('data-component', 'Action Dialog');
    expect(el.matches(selectorFor('Action'))).toBe(true);
    expect(el.matches(selectorFor('Dialog'))).toBe(true);
    expect(el.matches(selectorFor('Dia'))).toBe(false);
  });
});
