import { Base } from '@studiometa/js-toolkit';
import * as toolkit from '@studiometa/js-toolkit/';

describe('The package exports', () => {
  it('should export helpers and the Base class', () => {
    const names = [
      'Base',
      'createApp',
      'createBase',
      'default',
      'defineComponent',
      'importOnInteraction',
      'importWhenIdle',
      'importWhenVisible',
    ];
    expect(Object.keys(toolkit)).toEqual(names);
  });

  it('should export the Base class as default export', () => {
    expect(toolkit.default).toBe(Base);
  });
});
