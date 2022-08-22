import type Base from '../Base/index.js';
import type { BaseConstructor, BaseTypeParameter } from '../Base/index.js';
import useResize from '../services/resize.js';
import { isDev } from '../utils/index.js';

interface WithBreakpointObserverInterface {
  $options: {
    activeBreakpoints?: string;
    inactiveBreakpoints?: string;
  };
}

/**
 * Test the breakpoins of the given Base instance and return the hook to call.
 *
 * @param   {Base<WithBreakpointObserverInterface>} instance The component's instance.
 * @param   {string} [breakpoint] The breakpoint to test.
 * @returns {string} The action to trigger.
 */
function testBreakpoints(
  instance: Base<WithBreakpointObserverInterface>,
  breakpoint: string = useResize().props().breakpoint
): string {
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
 * @param  {Base<WithBreakpointObserverInterface>} instance A Base class instance.
 * @returns {boolean} True if configured correctly, false otherwise.
 */
function hasBreakpointConfiguration(instance: Base<WithBreakpointObserverInterface>): boolean {
  const { activeBreakpoints, inactiveBreakpoints } = instance.$options;
  return Boolean(activeBreakpoints || inactiveBreakpoints);
}

/**
 * Test if the given instance has a conflicting configuration for breakpoints.
 * @param  {Base<WithBreakpointObserverInterface>} instance A Base class instance.
 * @returns {void}
 */
function testConflictingBreakpointConfiguration(
  instance: Base<WithBreakpointObserverInterface>
): void {
  const { activeBreakpoints, inactiveBreakpoints, name } = instance.$options;
  if (activeBreakpoints && inactiveBreakpoints) {
    throw new Error(
      `[${name}] Incorrect configuration: the \`activeBreakpoints\` and \`inactiveBreakpoints\` are not compatible.`
    );
  }
}

/**
 * Add the current instance to the resize service.
 * @param {string} key      The key for the resize service callback.
 * @param {Base}   instance The instance to observe.
 */
function addToResize(key, instance) {
  if (isDev) {
    testConflictingBreakpointConfiguration(instance);
  }

  const { add, has } = useResize();

  if (!has(key)) {
    add(key, ({ breakpoint }) => {
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
export default function withBreakpointObserver<T extends BaseTypeParameter = BaseTypeParameter>(
  BaseClass: BaseConstructor
) {
  return class WithBreakpointObserver<
    U extends BaseTypeParameter = BaseTypeParameter
  > extends BaseClass<T & U> {
    static config = {
      ...BaseClass.config,
      name: `${BaseClass.config.name}WithBreakpointObserver`,
      options: {
        ...(BaseClass.config?.options || {}),
        activeBreakpoints: String,
        inactiveBreakpoints: String,
      },
    };

    /**
     * Watch for the document resize to test the breakpoints.
     *
     * @param  {HTMLElement} element The component's root element.
     */
    constructor(element) {
      super(element);

      const { remove, props } = useResize();
      const { name } = this.$options;

      // Do nothing if no breakpoint has been defined.
      // @see https://js-toolkit.meta.fr/services/resize.html#breakpoint
      if (!props().breakpoint) {
        if (isDev) {
          throw new Error(
            `[${name}] The \`BreakpointObserver\` class requires breakpoints to be defined.`
          );
        }
        return;
      }

      const key = `BreakpointObserver-${this.$id}`;

      // Watch change on the `data-options` attribute to emit the `set:options` event.
      const mutationObserver = new MutationObserver(([mutation]) => {
        if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'data-options' ||
            mutation.attributeName.startsWith('data-option-'))
        ) {
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
        return;
      }

      addToResize(key, this);
    }

    /**
     * Override the default $mount method to prevent component's from being
     * mounted when they should not.
     *
     * @returns {this}
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
}
