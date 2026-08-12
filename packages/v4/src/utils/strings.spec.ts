import { describe, expect, it } from 'vitest';
import { kebabCase } from './strings.js';

describe('kebabCase', () => {
  it('converts PascalCase and camelCase', () => {
    expect(kebabCase('SliderDragStart')).toBe('slider-drag-start');
    expect(kebabCase('fetchAfter')).toBe('fetch-after');
    expect(kebabCase('click')).toBe('click');
  });
});
