import { test, expect } from 'vitest';
import * as helpers from '#private/helpers/index.js';

test('helpers exports', () => {
  expect(Object.keys(helpers).toSorted()).toMatchInlineSnapshot(`
    [
      "closestComponent",
      "createApp",
      "getClosestParent",
      "getDirectChildren",
      "getInstanceFromElement",
      "importOnInteraction",
      "importOnMediaQuery",
      "importWhenIdle",
      "importWhenPrefersMotion",
      "importWhenVisible",
      "isDirectChild",
      "queryComponent",
      "queryComponentAll",
    ]
  `);
});
