import * as decorators from '@studiometa/js-toolkit/decorators';
import getFilenamesInFolder from '../__utils__/getFilenamesInFolder.js';

test('decorators exports', () => {
  const names = getFilenamesInFolder('../../js-toolkit/decorators/', import.meta.url);
  expect(Object.keys(decorators)).toEqual(names);
});
