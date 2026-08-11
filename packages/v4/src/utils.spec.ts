import { describe, expect, it } from 'vitest';
import { kebabCase, selectorFor } from './utils';

describe('kebabCase', () => {
  it('converts PascalCase and camelCase', () => {
    expect(kebabCase('SliderDragStart')).toBe('slider-drag-start');
    expect(kebabCase('fetchAfter')).toBe('fetch-after');
    expect(kebabCase('click')).toBe('click');
  });
});

describe('selectorFor', () => {
  it('matches whitespace-separated data-component tokens', () => {
    const el = document.createElement('div');
    el.setAttribute('data-component', 'Action Dialog');
    expect(el.matches(selectorFor('Action'))).toBe(true);
    expect(el.matches(selectorFor('Dialog'))).toBe(true);
    expect(el.matches(selectorFor('Dia'))).toBe(false);
  });
});
