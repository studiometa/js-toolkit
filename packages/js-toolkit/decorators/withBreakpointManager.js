import useResize from '../services/resize.js';

/**
 * @typedef {import('../abstracts/Base').default} Base
 * @typedef {import('../abstracts/Base').BaseComponent} BaseComponent
 */

/**
 * Test the breakpoins of the given Base instance and return the hook to call.
 *
 * @param  {Array<[String[], Base]>} breakpoints The breakpoints's data.
 */
function testBreakpoints(breakpoints) {
  const { breakpoint } = useResize().props();
  breakpoints.forEach(([breakpointKeys, instance]) => {
    if (breakpointKeys.includes(breakpoint)) {
      instance.$mount();
    } else {
      instance.$destroy();
    }
  });
}

/**
 * Prepare the components.
 * @param {Base} instance
 * @param {Array<[String, BaseComponent]>} breakpoints
 * @return {Array<[String, Base]>}
 */
function mountComponents(instance, breakpoints) {
  return breakpoints.map(([bk, ComponentClass]) => {
    const child = new ComponentClass(instance.$el);
    Object.defineProperty(child, '$parent', { get: () => instance });
    return [bk, child];
  });
}

/**
 * A cache object to hold each Base sub-instances.
 * @type {Object}
 */
const instances = {};

/**
 * BreakpointManager class.
 * @template {BaseComponent} T
 * @param {T} BaseClass
 * @param {Array<[String, BaseComponent]>} breakpoints
 * @return {typeof DecoratedClass}
 */
export default function withBreakpointManager(BaseClass, breakpoints) {
  if (!Array.isArray(breakpoints)) {
    throw new Error('[withBreakpointManager] The `breakpoints` parameter must be an array.');
  }

  if (breakpoints.length < 2) {
    throw new Error('[withBreakpointManager] You must define at least 2 breakpoints.');
  }

  const { add, props } = useResize();

  // Do nothing if no breakpoint has been defined.
  // @see https://js-toolkit.meta.fr/services/resize.html#breakpoint
  if (!props().breakpoint) {
    throw new Error(`The \`BreakpointManager\` class requires breakpoints to be defined.`);
  }

  /* eslint-disable require-jsdoc */
  // @ts-ignore
  class DecoratedClass extends BaseClass {
    /**
     * Watch for the document resize to test the breakpoints.
     * @param {HTMLElement} element The component's root element.
     */
    constructor(element) {
      super(element);

      if (!instances[this.$id]) {
        instances[this.$id] = mountComponents(this, breakpoints);
      }

      testBreakpoints(instances[this.$id]);

      add(`BreakpointManager-${this.$id}`, () => {
        testBreakpoints(instances[this.$id]);
      });

      return this;
    }

    /**
     * Override the default $mount method to prevent component's from being
     * mounted when they should not.
     *
     * @return {this}
     */
    $mount() {
      if (!instances[this.$id]) {
        instances[this.$id] = mountComponents(this, breakpoints);
      }

      testBreakpoints(instances[this.$id]);

      return super.$mount();
    }

    /**
     * Destroy all instances when the main one is destroyed.
     *
     * @return {this}
     */
    $destroy() {
      if (Array.isArray(instances[this.$id])) {
        instances[this.$id].forEach(([, instance]) => {
          instance.$destroy();
        });
      }

      return super.$destroy();
    }
  }

  return DecoratedClass;
}
