import Base from './Base';
import useResize from '../services/resize';

/**
 * Test the breakpoins of the given Base instance and return the hook to call.
 *
 * @param  {Base}           instance The component's instance.
 * @return {String|Boolean}          The action to call ($mount|$destroy) or false.
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
 * A cache object to hold each BreakpointManager sub-instances.
 * @type {Object}
 */
const instances = {};

/**
 * BreakpointManager class.
 */
export default class BreakpointManager extends Base {
  /**
   * Watch for the document resize to test the breakpoints.
   * @param  {HTMLElement} element The component's root element.
   * @return {BreakpointManager}          The current instance.
   */
  constructor(element) {
    super(element);

    const { add, props } = useResize();
    const { name, breakpoints } = this.$options;

    // Do nothing if no breakpoint has been defined.
    // @see https://js-toolkit.meta.fr/services/resize.html#breakpoint
    if (!props().breakpoint) {
      throw new Error(
        `[${name}] The \`BreakpointManager\` class requires breakpoints to be defined.`
      );
    }

    if (!breakpoints) {
      throw new Error(`[${name}] The \`breakpoint\` option must be defined.`);
    }

    if (!Array.isArray(breakpoints)) {
      throw new Error(`[${name}] The \`breakpoint\` option must be an array.`);
    }

    if (breakpoints.length < 2) {
      throw new Error(
        `[${name}] You must define at least 2 breakpoints when using the \`BreakpointManager\` class.`
      );
    }

    instances[this.$id] = breakpoints.map(([bk, ComponentClass]) => {
      // eslint-disable-next-line no-underscore-dangle
      ComponentClass.prototype.__isChild__ = true;
      const instance = new ComponentClass(this.$el);
      Object.defineProperty(instance, '$parent', { get: () => this });
      return [bk, instance];
    });

    add(`BreakpointManager-${this.$id}`, () => {
      testBreakpoints(instances[this.$id]);
    });

    return this;
  }

  /**
   * Override the default $mount method to prevent component's from being
   * mounted when they should not.
   * @return {BreakpointManager} The component's instance.
   */
  $mount() {
    testBreakpoints(instances[this.$id]);
    return super.$mount();
  }
}
