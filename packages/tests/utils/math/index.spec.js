import * as math from '@studiometa/js-toolkit/utils/math';

describe('@studiometa/js-toolkit/utils/math exports', () => {
  it('should export all scripts', () => {
    expect(Object.keys(math)).toEqual([
      'clamp',
      'clamp01',
      'damp',
      'inertiaFinalValue',
      'lerp',
      'map',
      'round',
    ]);
  });
});
