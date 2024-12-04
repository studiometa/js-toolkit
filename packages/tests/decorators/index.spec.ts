import { test, expect } from 'vitest';
import * as decorators from '#private/decorators/index.js';

test('decorators exports', () => {
  expect(Object.keys(decorators).toSorted()).toMatchInlineSnapshot(`
    [
      "withBreakpointManager",
      "withBreakpointObserver",
      "withDrag",
      "withExtraConfig",
      "withFreezedOptions",
      "withIntersectionObserver",
      "withMountOnMediaQuery",
      "withMountWhenInView",
      "withMountWhenPrefersMotion",
      "withMutation",
      "withName",
      "withRelativePointer",
      "withResponsiveOptions",
      "withScrolledInView",
    ]
  `);
});
