import * as utils from '~/utils';

describe('~/utils exports', () => {
  it('should export all scripts', () => {
    expect(Object.keys(utils)).toEqual([
      'debounce',
      'focusTrap',
      'keyCodes',
      'nextFrame',
      'throttle',
      'css',
      'math',
      'object',
      'history',
    ]);
  });
});
