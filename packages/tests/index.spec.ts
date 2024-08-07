import { describe, it, expect } from 'vitest';
import * as toolkit from '@studiometa/js-toolkit';

describe('The package exports', () => {
  it('should export helpers and the Base class', () => {
    expect(Object.keys(toolkit).toSorted()).toMatchInlineSnapshot(`
      [
        "Base",
        "createApp",
        "getClosestParent",
        "getDirectChildren",
        "getInstanceFromElement",
        "getInstances",
        "importOnInteraction",
        "importOnMediaQuery",
        "importWhenIdle",
        "importWhenPrefersMotion",
        "importWhenVisible",
        "isDirectChild",
        "useDrag",
        "useKey",
        "useLoad",
        "usePointer",
        "useRaf",
        "useResize",
        "useScroll",
        "useService",
        "withBreakpointManager",
        "withBreakpointObserver",
        "withDrag",
        "withExtraConfig",
        "withFreezedOptions",
        "withIntersectionObserver",
        "withMountOnMediaQuery",
        "withMountWhenInView",
        "withMountWhenPrefersMotion",
        "withName",
        "withRelativePointer",
        "withResponsiveOptions",
        "withScrolledInView",
      ]
    `);
  });
});
