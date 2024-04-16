import { test, expect } from 'bun:test';
import * as toolkit from '@studiometa/js-toolkit';
import { getFilenamesInFolder } from '#test-utils';

const services = Object.fromEntries(
  Object.entries(toolkit).filter(([name]) => name.startsWith('use')),
);

function capitalize(str) {
  return str.replace(/^\w/, (c) => c.toUpperCase());
}

test('components exports', () => {
  const names = getFilenamesInFolder('../../js-toolkit/services/', import.meta.url)
    .filter((name) => name !== 'Service')
    .map((name) => `use${capitalize(name)}`);
  expect(Object.keys(services).toSorted()).toEqual(names.toSorted());
});
