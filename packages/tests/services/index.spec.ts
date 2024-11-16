import { test, expect } from 'vitest';
import * as services from '#private/services';

test('components exports', () => {
  expect(Object.keys(services).toSorted()).toMatchInlineSnapshot(`
    [
      "AbstractService",
      "DragService",
      "KeyService",
      "LoadService",
      "PointerService",
      "RafService",
      "ResizeService",
      "ScrollService",
      "useDrag",
      "useKey",
      "useLoad",
      "usePointer",
      "useRaf",
      "useResize",
      "useScroll",
    ]
  `);
});
