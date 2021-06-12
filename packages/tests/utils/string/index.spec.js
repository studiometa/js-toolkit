import {
  withTrailingSlash,
  withoutTrailingSlash,
  withTrailingCharacters,
  withoutTrailingCharacters,
} from '@studiometa/js-toolkit/utils/string/index.js';

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

describe('The trailing characters utilities', () => {
  it('should add characters', () => {
    expect(withTrailingCharacters('foo', '__')).toBe('foo__');
    expect(withTrailingCharacters('foo__', '__')).toBe('foo__');
  });
  it('should remove characters', () => {
    expect(withoutTrailingCharacters('foo', '__')).toBe('foo');
    expect(withoutTrailingCharacters('foo__', '__')).toBe('foo');
  });
});
