import * as utils from '@studiometa/js-toolkit/utils';

describe('@studiometa/js-toolkit/utils exports', () => {
  it('should export all scripts', () => {
    expect(Object.keys(utils)).toEqual([
      'collide',
      'css',
      'debounce',
      'focusTrap',
      'history',
      'keyCodes',
      'math',
      'memoize',
      'nextFrame',
      'object',
      'string',
      'throttle',
    ]);
  });
});
