import * as object from '@studiometa/js-toolkit/utils/object/index.js';

describe('@studiometa/js-toolkit/utils/object exports', () => {
  it('should export all scripts', () => {
    expect(Object.keys(object)).toEqual(['autoBind', 'getAllProperties']);
  });
});
