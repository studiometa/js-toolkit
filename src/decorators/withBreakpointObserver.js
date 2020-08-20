import useResize from '../services/resize';

/**
 * Test the breakpoins of the given Base instance and return the hook to call.
 *
 * @param  {BreakpointObserver} instance The component's instance.
 * @return {Sring}                       The action to trigger.
 */
function testBreakpoints(instance, breakpoint = useResize().props().breakpoint) {
  const { activeBreakpoints, inactiveBreakpoints } = instance.$options;
  const isInActiveBreakpoint =
    activeBreakpoints && activeBreakpoints.split(' ').includes(breakpoint);
  const isInInactiveBreakpoint =
    inactiveBreakpoints && inactiveBreakpoints.split(' ').includes(breakpoint);

  if (
    (activeBreakpoints && isInActiveBreakpoint) ||
    (inactiveBreakpoints && !isInInactiveBreakpoint)
  ) {
    return '$mount';
  }

  if (
    (activeBreakpoints && !isInActiveBreakpoint) ||
    (inactiveBreakpoints && isInInactiveBreakpoint)
  ) {
    return '$destroy';
  }

  return '';
}

/**
 * Test if the given instance is configured for breakpoints.
 * @param  {Base}    instance A Base class instance.
 * @return {Boolean}          True if configured correctly, false otherwise.
 */
function hasBreakpointConfiguration(instance) {
  const { activeBreakpoints, inactiveBreakpoints } = instance.$options;
  return Boolean(activeBreakpoints || inactiveBreakpoints);
}

/**
 * Test if the given instance has a conflicting configuration for breakpoints.
 * @param  {Base}    instance A Base class instance.
 * @return {Boolean}          True if configured incorrectly, false otherwise.
 */
function hasConflictingBreakpointConfiguration(instance) {
  const { activeBreakpoints, inactiveBreakpoints } = instance.$options;
  return Boolean(activeBreakpoints && inactiveBreakpoints);
}

/**
 * BreakpointObserver class.
 */
export default BaseClass =>
  class BreakpointObserver extends BaseClass {
    /**
     * Watch for the document resize to test the breakpoints.
     * @param  {HTMLElement} element The component's root element.
     * @return {BreakpointObserver}          The current instance.
     */
    constructor(element) {
      super(element);

      const { add, props } = useResize();
      const { name } = this.$options;

      // Do nothing if no breakpoint has been defined.
      // @see https://js-toolkit.meta.fr/services/resize.html#breakpoint
      if (!props().breakpoint) {
        throw new Error(
          `[${name}] The \`BreakpointObserver\` class requires breakpoints to be defined.`
        );
      }

      // Stop here silently when no breakpoint configuration given.
      if (!hasBreakpointConfiguration(this)) {
        return this;
      }

      // Do nothing if both configuration are set, as they are not compatible.
      if (hasConflictingBreakpointConfiguration(this)) {
        throw new Error(
          `[${name}]  Incorrect configuration: the \`activeBreakpoints\` and \`inactiveBreakpoints\` are not compatible.`
        );
      }

      add(`BreakpointObserver-${this.$id}`, ({ breakpoint }) => {
        const action = testBreakpoints(this, breakpoint);
        if (action) {
          this[action]();
        }
      });

      return this;
    }

    /**
     * Override the default $mount method to prevent component's from being
     * mounted when they should not.
     * @return {BreakpointObserver} The component's instance.
     */
    $mount() {
      // Execute normal behavior when no breakpoint configuration given.
      if (!hasBreakpointConfiguration(this)) {
        return super.$mount();
      }

      const action = testBreakpoints(this);
      if (action === '$mount') {
        return super.$mount();
      }

      return this;
    }
  };
