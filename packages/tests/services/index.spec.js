import * as services from '@studiometa/js-toolkit/services';

describe('@studiometa/js-toolkit/services exports', () => {
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
