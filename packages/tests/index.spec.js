import { Base } from '@studiometa/js-toolkit';
import * as toolkit from '@studiometa/js-toolkit';

describe('The package exports', () => {
  it('should export helpers and the Base class', () => {
    const names = [
      'Base',
      'createApp',
      'importOnInteraction',
      'importWhenIdle',
      'importWhenVisible',
      'useDrag',
      'useKey',
      'useLoad',
      'usePointer',
      'useRaf',
      'useResize',
      'useScroll',
      'withBreakpointManager',
      'withBreakpointObserver',
      'withDrag',
      'withExtraConfig',
      'withIntersectionObserver',
      'withMountWhenInView',
    ];
    expect(Object.keys(toolkit)).toEqual(names);
  });
});
