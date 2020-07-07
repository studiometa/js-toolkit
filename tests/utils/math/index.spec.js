import * as math from '~/utils/math';

describe('~/utils/math exports', () => {
  it('should export all scripts', () => {
    expect(Object.keys(math)).toEqual(['damp', 'lerp', 'map', 'round']);
  });
});
