import * as utils from '@studiometa/js-toolkit/utils/collide';

describe('~/utils/collide exports', () => {
  it('should export all scripts', () => {
    expect(Object.keys(utils)).toEqual([
      'boundingRectToCircle',
      'collideCircleCircle',
      'collideCircleRect',
      'collidePointCircle',
      'collidePointRect',
      'collideRectRect',
    ]);
  });
});
