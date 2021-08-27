import Base from '@studiometa/js-toolkit/abstracts/Base';
import * as toolkit from '@studiometa/js-toolkit/';

describe('The package exports', () => {
  it('should export the legacy helpers and the Base class', () => {
    const names = ['Base', 'createBase', 'default', 'defineComponent'];
    expect(Object.keys(toolkit)).toEqual(names);
  });

  it('should export the Base class as default export', () => {
    expect(toolkit.default).toBe(Base);
  });
});
