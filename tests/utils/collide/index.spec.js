import * as utils from '~/utils/collide';

describe('~/utils/collide exports', () => {
  it('should export all scripts', () => {
    expect(Object.keys(utils)).toEqual(['collidePointRect', 'collideRectRect']);
  });
});
