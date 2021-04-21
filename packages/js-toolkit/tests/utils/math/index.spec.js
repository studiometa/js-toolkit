import * as math from '~/utils/math';

describe('~/utils/math exports', () => {
  it('should export all scripts', () => {
    expect(Object.keys(math)).toEqual(['clamp', 'clamp01', 'damp', 'lerp', 'map', 'round']);
  });
});
