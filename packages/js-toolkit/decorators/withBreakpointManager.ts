import type { BaseDecorator, BaseInterface } from '../Base/types.js';
import type { Base, BaseConstructor, BaseProps } from '../Base/index.js';
import { useResize } from '../services/index.js';
import { isDev, isArray } from '../utils/index.js';

/**
 * Test the breakpoins of the given Base instance and return the hook to call.
 */
function testBreakpoints(breakpoints: Array<[string[], Base]>) {
  const { breakpoint } = useResize().props();
  for (const [breakpointKeys, instance] of breakpoints) {
    if (breakpointKeys.includes(breakpoint) && !instance.$isMounted) {
      setTimeout(() => instance.$mount(), 0);
    } else if (!breakpointKeys.includes(breakpoint) && instance.$isMounted) {
      instance.$destroy();
    }
  }
}

/**
 * Prepare the components.
 */
function mountComponents(
  instance: Base,
  breakpoints: Array<[string, BaseConstructor]>,
): Array<[string[], Base]> {
  return breakpoints.map(([bk, ComponentClass]) => {
    const child = new ComponentClass(instance.$el);
    Object.defineProperty(child, '$parent', { get: () => instance.$parent });
    return [bk.split(' '), child];
  });
}

/**
 * A cache object to hold each Base sub-instances.
 */
const instances: WeakMap<Base, Array<[string[], Base]>> = new WeakMap();

/**
 * BreakpointManager class.
 */
export function withBreakpointManager<S extends Base>(
  BaseClass: typeof Base,
  breakpoints: Array<[string, BaseConstructor<Base>]>,
): BaseDecorator<BaseInterface, S> {
  if (!isArray(breakpoints)) {
    if (isDev) {
      throw new Error('[withBreakpointManager] The `breakpoints` parameter must be an array.');
    }

    // @ts-ignore
    return BaseClass;
  }

  if (breakpoints.length < 2) {
    if (isDev) {
      throw new Error('[withBreakpointManager] You must define at least 2 breakpoints.');
    }

    // @ts-ignore
    return BaseClass;
  }

  const { add, props } = useResize();

  // Do nothing if no breakpoint has been defined.
  // @link https://js-toolkit.studiometa.dev/api/services/useResize.html#breakpoint
  if (!props().breakpoint) {
    if (isDev) {
      throw new Error('The `BreakpointManager` class requires breakpoints to be defined.');
    }

    // @ts-ignore
    return BaseClass;
  }

  /**
   * Class.
   */
  class WithBreakpointManager<T extends BaseProps = BaseProps> extends BaseClass<T> {
    /**
     * Watch for the document resize to test the breakpoints.
     */
    constructor(element: HTMLElement) {
      super(element);

      if (!instances.has(this)) {
        instances.set(this, mountComponents(this, breakpoints));
      }

      add(`BreakpointManager-${this.$id}`, () => {
        testBreakpoints(instances.get(this));
      });
    }

    /**
     * Override the default $mount method to prevent component's from being
     * mounted when they should not.
     */
    async $mount() {
      await super.$mount();

      testBreakpoints(instances.get(this));

      return this;
    }

    /**
     * Destroy all instances when the main one is destroyed.
     */
    async $destroy() {
      const promises = [];
      if (isArray(instances.get(this))) {
        for (const [, instance] of instances.get(this)) {
          promises.push(instance.$destroy());
        }
      }

      await Promise.all(promises);

      return super.$destroy();
    }
  }

  // @ts-ignore
  return WithBreakpointManager;
}
