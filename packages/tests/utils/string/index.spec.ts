import { describe, it, expect } from '@jest/globals';
import {
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
} from '@studiometa/js-toolkit/utils';

describe('The trailing slash utilities', () => {
  it('should add a trailing slash', () => {
    expect(withTrailingSlash('foo')).toBe('foo/');
    expect(withTrailingSlash('foo/')).toBe('foo/');
  });

  it('should remove the trailing slash', () => {
    expect(withoutTrailingSlash('foo/')).toBe('foo');
    expect(withoutTrailingSlash('foo')).toBe('foo');
  });
});

describe('The leading slash utilities', () => {
  it('should add a leading slash', () => {
    expect(withLeadingSlash('foo')).toBe('/foo');
    expect(withLeadingSlash('/foo')).toBe('/foo');
  });

  it('should remove the leading slash', () => {
    expect(withoutLeadingSlash('/foo')).toBe('foo');
    expect(withoutLeadingSlash('foo')).toBe('foo');
  });
});

describe('The trailing characters utilities', () => {
  it('should add characters', () => {
    expect(withTrailingCharacters('foo', '__')).toBe('foo__');
    expect(withTrailingCharacters('foo__', '__')).toBe('foo__');
  });
  it('should remove characters', () => {
    expect(withoutTrailingCharacters('foo', '__')).toBe('foo');
    expect(withoutTrailingCharacters('foo__', '__')).toBe('foo');
  });
  it('should remove characters recursively', () => {
    expect(withoutTrailingCharactersRecursive('foo__', '__')).toBe('foo');
    expect(withoutTrailingCharactersRecursive('foo____', '__')).toBe('foo');
  });
});

describe('The leading characters utilities', () => {
  it('should add characters', () => {
    expect(withLeadingCharacters('foo', '__')).toBe('__foo');
    expect(withLeadingCharacters('__foo', '__')).toBe('__foo');
  });
  it('should remove characters', () => {
    expect(withoutLeadingCharacters('foo', '__')).toBe('foo');
    expect(withoutLeadingCharacters('__foo', '__')).toBe('foo');
  });
  it('should remove characters recursively', () => {
    expect(withoutLeadingCharactersRecursive('__foo', '__')).toBe('foo');
    expect(withoutLeadingCharactersRecursive('____foo', '__')).toBe('foo');
  });
});
