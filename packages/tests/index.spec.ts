import { describe, it, expect } from 'vitest';
import * as toolkit from '@studiometa/js-toolkit';

describe('The package exports', () => {
  it('should export helpers and the Base class', () => {
    expect(Object.keys(toolkit).toSorted()).toMatchInlineSnapshot(`
      [
        "AbstractService",
        "Base",
        "DragService",
        "KeyService",
        "LoadService",
        "MutationService",
        "PointerService",
        "RafService",
        "ResizeService",
        "ScrollService",
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
        "registerComponent",
        "useDrag",
        "useKey",
        "useLoad",
        "useMutation",
        "usePointer",
        "useRaf",
        "useResize",
        "useScroll",
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
});
