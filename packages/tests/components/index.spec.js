import * as components from '@studiometa/js-toolkit/components';
import getFilenamesInFolder from '../__utils__/getFilenamesInFolder.js';

test('components exports', () => {
  const names = getFilenamesInFolder('../../js-toolkit/components/', import.meta.url);
  expect(Object.keys(components)).toEqual(names);
});
