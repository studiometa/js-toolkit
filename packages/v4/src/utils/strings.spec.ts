import { describe, expect, it } from 'vitest';
import {
  camelCase,
  capitalize,
  kebabCase,
  lowerCase,
  pascalCase,
  snakeCase,
  upperCase,
  withLeadingCharacters,
  withLeadingSlash,
  withoutLeadingCharacters,
  withoutLeadingCharactersRecursive,
  withoutLeadingSlash,
  withoutTrailingCharacters,
  withoutTrailingCharactersRecursive,
  withoutTrailingSlash,
  withTrailingCharacters,
  withTrailingSlash,
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

describe('leading and trailing characters', () => {
  it('adds the characters once, however many are already there', () => {
    expect(withLeadingCharacters('foo', '/')).toBe('/foo');
    expect(withLeadingCharacters('/foo', '/')).toBe('/foo');
    expect(withTrailingCharacters('foo', '/')).toBe('foo/');
    expect(withTrailingCharacters('foo/', '/')).toBe('foo/');
    expect(withLeadingCharacters('bar', 'foo-')).toBe('foo-bar');
  });

  it('removes the characters once', () => {
    expect(withoutLeadingCharacters('//foo', '/')).toBe('/foo');
    expect(withoutTrailingCharacters('foo//', '/')).toBe('foo/');
    expect(withoutLeadingCharacters('foo', '/')).toBe('foo');
  });

  it('removes the characters as often as they repeat', () => {
    expect(withoutLeadingCharactersRecursive('///foo', '/')).toBe('foo');
    expect(withoutTrailingCharactersRecursive('foo///', '/')).toBe('foo');
    expect(withoutLeadingCharactersRecursive('foo', '/')).toBe('foo');
  });

  it('treats no characters as nothing to do', () => {
    expect(withLeadingCharacters('foo', '')).toBe('foo');
    expect(withTrailingCharacters('foo', '')).toBe('foo');
    expect(withoutLeadingCharacters('foo', '')).toBe('foo');
    expect(withoutTrailingCharacters('foo', '')).toBe('foo');
    expect(withoutLeadingCharactersRecursive('foo', '')).toBe('foo');
    expect(withoutTrailingCharactersRecursive('foo', '')).toBe('foo');
  });

  it('matches the characters literally', () => {
    expect(withoutLeadingCharacters('.foo', '.')).toBe('foo');
    expect(withoutLeadingCharacters('afoo', '.')).toBe('afoo');
    expect(withoutTrailingCharacters('foo.', '.')).toBe('foo');
    expect(withoutTrailingCharacters('fooa', '.')).toBe('fooa');
  });
});

describe('leading and trailing slashes', () => {
  it('adds a slash once', () => {
    expect(withLeadingSlash('foo')).toBe('/foo');
    expect(withLeadingSlash('/foo')).toBe('/foo');
    expect(withTrailingSlash('foo')).toBe('foo/');
    expect(withTrailingSlash('foo/')).toBe('foo/');
  });

  it('removes a slash once', () => {
    expect(withoutLeadingSlash('/foo')).toBe('foo');
    expect(withoutLeadingSlash('foo')).toBe('foo');
    expect(withoutTrailingSlash('foo/')).toBe('foo');
    expect(withoutTrailingSlash('foo')).toBe('foo');
  });
});
