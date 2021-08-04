import * as services from '@studiometa/js-toolkit/services';
import getFilenamesInFolder from '../__utils__/getFilenamesInFolder.js';

function capitalize(str) {
  return str.replace(/^\w/, (c) => c.toUpperCase());
}

test('components exports', () => {
  const names = getFilenamesInFolder('../../js-toolkit/services/', import.meta.url).map(
    (name) => `use${capitalize(name)}`
  );
  expect(Object.keys(services)).toEqual(names);
});
