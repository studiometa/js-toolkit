import * as services from '~/services';

describe('~/services exports', () => {
  it('should export all scripts', () => {
    expect(Object.keys(services)).toEqual([
      'useKey',
      'useLoad',
      'usePointer',
      'useRaf',
      'useResize',
      'useScroll',
    ]);
  });
});
