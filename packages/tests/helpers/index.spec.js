import * as helpers from '@studiometa/js-toolkit/helpers';
import getFilenamesInFolder from '../__utils__/getFilenamesInFolder.js';

test('helpers exports', () => {
  const names = getFilenamesInFolder('../../js-toolkit/helpers/', import.meta.url).filter(key => key !== 'utils');
  expect(Object.keys(helpers)).toEqual(names);
});
