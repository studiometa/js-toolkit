import { describe, expect, it } from 'vitest';
import {
  camelCase,
  capitalize,
  kebabCase,
  lowerCase,
  pascalCase,
  snakeCase,
  upperCase,
} from './strings.js';

describe('lowerCase and upperCase', () => {
  it('change the case of the whole string', () => {
    expect(lowerCase('FooBar')).toBe('foobar');
    expect(upperCase('FooBar')).toBe('FOOBAR');
  });
});

describe('capitalize', () => {
  it('capitalizes the first character and leaves the rest alone', () => {
    expect(capitalize('btn')).toBe('Btn');
    expect(capitalize('myRef')).toBe('MyRef');
    expect(capitalize('my-ref')).toBe('My-ref');
    expect(capitalize('')).toBe('');
  });
});

describe('pascalCase', () => {
  it('splits words on every boundary', () => {
    expect(pascalCase('my-ref')).toBe('MyRef');
    expect(pascalCase('my ref')).toBe('MyRef');
    expect(pascalCase('my_ref')).toBe('MyRef');
    expect(pascalCase('myRef')).toBe('MyRef');
    expect(pascalCase('MYRef')).toBe('MyRef');
    expect(pascalCase('')).toBe('');
  });
});

describe('camelCase', () => {
  it('lowercases the first word', () => {
    expect(camelCase('my-ref')).toBe('myRef');
    expect(camelCase('MyRef')).toBe('myRef');
    expect(camelCase('my ref name')).toBe('myRefName');
  });
});

describe('kebabCase', () => {
  it('converts the names the framework reads from source', () => {
    expect(kebabCase('SliderDragStart')).toBe('slider-drag-start');
    expect(kebabCase('fetchAfter')).toBe('fetch-after');
    expect(kebabCase('click')).toBe('click');
    expect(kebabCase('')).toBe('');
  });

  it('splits on a digit-to-letter boundary', () => {
    expect(kebabCase('H2Click')).toBe('h2-click');
    expect(kebabCase('slide2')).toBe('slide2');
  });

  it('treats anything but a letter or a digit as a separator', () => {
    expect(kebabCase('foo_bar')).toBe('foo-bar');
    expect(kebabCase('foo bar')).toBe('foo-bar');
    expect(kebabCase('--foo--bar--')).toBe('foo-bar');
  });
});

describe('snakeCase', () => {
  it('joins the words with an underscore', () => {
    expect(snakeCase('SliderDragStart')).toBe('slider_drag_start');
    expect(snakeCase('foo-bar')).toBe('foo_bar');
  });
});
