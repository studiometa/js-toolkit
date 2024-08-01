import { test, expect } from 'vitest';
import * as services from '#private/services';
import { getFilenamesInFolder } from '#test-utils';

test('components exports', () => {
  expect(Object.keys(services).toSorted()).toMatchInlineSnapshot(`
    [
      "useDrag",
      "useKey",
      "useLoad",
      "usePointer",
      "useRaf",
      "useResize",
      "useScroll",
      "useService",
    ]
  `);
});
