import { test, expect } from 'bun:test';
import * as decorators from '../../js-toolkit/decorators/index.js';
import getFilenamesInFolder from '../__utils__/getFilenamesInFolder.js';

test('decorators exports', () => {
  const names = getFilenamesInFolder('../../js-toolkit/decorators/', import.meta.url);
  expect(Object.keys(decorators).toSorted()).toEqual(names.toSorted());
});
