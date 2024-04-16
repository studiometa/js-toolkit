import { test, expect } from 'bun:test';
import * as decorators from '#private/decorators/index.js';
import { getFilenamesInFolder } from '#test-utils';

test('decorators exports', () => {
  const names = getFilenamesInFolder('../../js-toolkit/decorators/', import.meta.url);
  expect(Object.keys(decorators).toSorted()).toEqual(names.toSorted());
});
