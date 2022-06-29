import useResize from '../services/resize.js';
import { isDev, isArray } from '../utils/index.js';

/**
 * @typedef {import('../Base').default} Base
 * @typedef {import('../Base').BaseConstructor} BaseConstructor
 */

/**
 * Test the breakpoins of the given Base instance and return the hook to call.
 *
 * @param  {Array<[string[], Base]>} breakpoints The breakpoints's data.
 */
function testBreakpoints(breakpoints) {
  const { breakpoint } = useResize().props();
  breakpoints.forEach(([breakpointKeys, instance]) => {
    if (breakpointKeys.includes(breakpoint) && !instance.$isMounted) {
      setTimeout(() => instance.$mount(), 0);
    } else if (!breakpointKeys.includes(breakpoint) && instance.$isMounted) {
      instance.$destroy();
    }
  });
}

/**
 * Prepare the components.
 * @param {Base} instance
 * @param {Array<[string, BaseConstructor]>} breakpoints
 * @returns {Array<[string, Base]>}
 */
function mountComponents(instance, breakpoints) {
  return breakpoints.map(([bk, ComponentClass]) => {
    const child = new ComponentClass(instance.$el);
    Object.defineProperty(child, '$parent', { get: () => instance.$parent });
    return [bk, child];
  });
}

/**
 * A cache object to hold each Base sub-instances.
 * @type {Object}
 */
const instances = new WeakMap();

/**
 * BreakpointManager class.
 * @template {BaseConstructor} T
 * @param {T} BaseClass
 * @param {Array<[string, BaseConstructor]>} breakpoints
 * @returns {T}
 */
export default function withBreakpointManager(BaseClass, breakpoints) {
  if (!isArray(breakpoints)) {
    if (isDev) {
      throw new Error('[withBreakpointManager] The `breakpoints` parameter must be an array.');
    }
    return BaseClass;
  }

  if (breakpoints.length < 2) {
    if (isDev) {
      throw new Error('[withBreakpointManager] You must define at least 2 breakpoints.');
    }
    return BaseClass;
  }

  const { add, props } = useResize();

  // Do nothing if no breakpoint has been defined.
  // @see https://js-toolkit.meta.fr/services/resize.html#breakpoint
  if (!props().breakpoint) {
    if (isDev) {
      throw new Error(`The \`BreakpointManager\` class requires breakpoints to be defined.`);
    }
    return BaseClass;
  }

  // @ts-ignore
  return class extends BaseClass {
    /**
     * Watch for the document resize to test the breakpoints.
     * @param {HTMLElement} element The component's root element.
     */
    constructor(element) {
      super(element);

      if (!instances.has(this)) {
        instances.set(this, mountComponents(this, breakpoints));
      }

      add(`BreakpointManager-${this.$id}`, () => {
        testBreakpoints(instances.get(this));
      });

      this.instances = instances.get(this);
    }

    /**
     * Override the default $mount method to prevent component's from being
     * mounted when they should not.
     *
     * @returns {this}
     */
    $mount() {
      super.$mount();

      testBreakpoints(instances.get(this));

      return this;
    }

    /**
     * Destroy all instances when the main one is destroyed.
     *
     * @returns {this}
     */
    $destroy() {
      if (isArray(instances.get(this))) {
        instances.get(this).forEach(([, instance]) => {
          instance.$destroy();
        });
      }

      return super.$destroy();
    }
  };
}
