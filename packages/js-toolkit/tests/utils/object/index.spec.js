import * as object from '~/utils/object';

describe('~/utils/object exports', () => {
  it('should export all scripts', () => {
    expect(Object.keys(object)).toEqual(['autoBind', 'getAllProperties', 'isObject']);
  });
});
