import { test, expect } from 'vitest';
import * as services from '#private/services';

test('components exports', () => {
  expect(Object.keys(services).toSorted()).toMatchInlineSnapshot(`
    [
      "DragService",
      "KeyService",
      "LoadService",
      "PointerService",
      "RafService",
      "ResizeService",
      "ScrollService",
      "Service",
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
