import * as lazyImport from '@studiometa/js-toolkit/lazy-import';
import getFilenamesInFolder from '../__utils__/getFilenamesInFolder.js';

test('lazy-import exports', () => {
  const names = getFilenamesInFolder('../../js-toolkit/lazy-import/', import.meta.url).filter(key => key !== 'utils');
  expect(Object.keys(lazyImport)).toEqual(names);
});
