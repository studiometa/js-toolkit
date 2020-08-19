import Base from './Base';
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
 * BreakpointObserver class.
 */
export default class BreakpointObserver extends Base {
  /**
   * Watch for the document resize to test the breakpoints.
   * @param  {HTMLElement} element The component's root element.
   * @return {BreakpointObserver}          The current instance.
   */
  constructor(element) {
    super(element);

    const { add, props } = useResize();
    const { activeBreakpoints, inactiveBreakpoints, name } = this.$options;

    // Do nothing if no breakpoint has been defined.
    // @see https://js-toolkit.meta.fr/services/resize.html#breakpoint
    if (!props().breakpoint) {
      throw new Error(
        `[${name}] The \`BreakpointObserver\` class requires breakpoints to be defined.`
      );
    }

    // Do nothing if no configuration set or if both configuration are set, as
    // they are not compatible.
    if (
      (!activeBreakpoints && !inactiveBreakpoints) ||
      (activeBreakpoints && inactiveBreakpoints)
    ) {
      let message = `[${name}] `;
      if (!activeBreakpoints && !inactiveBreakpoints) {
        message +=
          'Missing configuration: specify the `activeBreakpoints` or `inactiveBreakpoints` config.';
      } else {
        message +=
          'Incorrect configuration: the `activeBreakpoints` and `inactiveBreakpoints` are not compatible.';
      }
      throw new Error(message);
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
    const action = testBreakpoints(this);
    if (action === '$mount') {
      return super.$mount();
    }

    return this;
  }
}
