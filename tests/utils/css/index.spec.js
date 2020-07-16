import * as css from '~/utils/css';

describe('~/utils/css exports', () => {
  it('should export all scripts', () => {
    expect(Object.keys(css)).toEqual(['transition', 'classes', 'styles']);
  });
});
