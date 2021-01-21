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

  return '$destroy';
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
 * @param  {Base} instance A Base class instance.
 * @return {void}
 */
function testConflictingBreakpointConfiguration(instance) {
  const { activeBreakpoints, inactiveBreakpoints, name } = instance.$options;
  if (activeBreakpoints && inactiveBreakpoints) {
    throw new Error(
      `[${name}] Incorrect configuration: the \`activeBreakpoints\` and \`inactiveBreakpoints\` are not compatible.`
    );
  }
}

/**
 * Add the current instance to the resize service.
 * @param {String} key      The key for the resize service callback.
 * @param {Base}   instance The instance to observe.
 */
function addToResize(key, instance) {
  testConflictingBreakpointConfiguration(instance);
  const { add, has } = useResize();

  if (!has(key)) {
    add(key, function onResize({ breakpoint }) {
      const action = testBreakpoints(instance, breakpoint);

      // Always destroy before mounting
      if (action === '$destroy' && instance.$isMounted) {
        instance[action]();
      } else if (action === '$mount' && !instance.$isMounted) {
        setTimeout(() => instance[action](), 0);
      }
    });
  }
}

/**
 * BreakpointObserver class.
 */
export default (BaseClass) =>
  class BreakpointObserver extends BaseClass {
    /**
     * Watch for the document resize to test the breakpoints.
     * @param  {HTMLElement} element The component's root element.
     * @return {BreakpointObserver}          The current instance.
     */
    constructor(element) {
      super(element);

      const { add, has, remove, props } = useResize();
      const { name } = this.$options;

      // Do nothing if no breakpoint has been defined.
      // @see https://js-toolkit.meta.fr/services/resize.html#breakpoint
      if (!props().breakpoint) {
        throw new Error(
          `[${name}] The \`BreakpointObserver\` class requires breakpoints to be defined.`
        );
      }

      const key = `BreakpointObserver-${this.$id}`;

      // Watch change on the `data-options` attribute to emit the `set:options` event.
      const mutationObserver = new MutationObserver(([mutation]) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-options') {
          // Stop here silently when no breakpoint configuration given.
          if (!hasBreakpointConfiguration(this)) {
            this.$mount();
            remove(key);
            return;
          }

          addToResize(key, this);
        }
      });
      mutationObserver.observe(this.$el, { attributes: true });

      // Stop here silently when no breakpoint configuration given.
      if (!hasBreakpointConfiguration(this)) {
        return this;
      }

      addToResize(key, this);
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
