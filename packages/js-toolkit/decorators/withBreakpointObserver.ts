import type { BaseDecorator, BaseInterface } from '../Base/types.js';
import type { Base, BaseProps, BaseConfig } from '../Base/index.js';
import { useResize } from '../services/index.js';
import { isDev, startsWith } from '../utils/index.js';
import { features } from '../Base/features.js';

export interface WithBreakpointObserverProps extends BaseProps {
  $options: {
    activeBreakpoints?: string;
    inactiveBreakpoints?: string;
  };
}

export interface WithBreakpointObserverInterface extends BaseInterface {}

/**
 * Test the breakpoins of the given Base instance and return the hook to call.
 *
 * @param   {Base<WithBreakpointObserverProps>} instance The component's instance.
 * @param   {string} [breakpoint] The breakpoint to test.
 * @returns {string} The action to trigger.
 */
function testBreakpoints(
  instance: Base<WithBreakpointObserverProps>,
  breakpoint: string = useResize().props().breakpoint,
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
 *
 * @param  {Base<WithBreakpointObserverProps>} instance A Base class instance.
 * @returns {boolean} True if configured correctly, false otherwise.
 */
function hasBreakpointConfiguration(instance: Base<WithBreakpointObserverProps>): boolean {
  const { activeBreakpoints, inactiveBreakpoints } = instance.$options;
  return Boolean(activeBreakpoints || inactiveBreakpoints);
}

/**
 * Test if the given instance has a conflicting configuration for breakpoints.
 *
 * @param  {Base<WithBreakpointObserverProps>} instance A Base class instance.
 * @returns {void}
 */
function testConflictingBreakpointConfiguration(instance: Base<WithBreakpointObserverProps>): void {
  const { activeBreakpoints, inactiveBreakpoints, name } = instance.$options;
  if (activeBreakpoints && inactiveBreakpoints) {
    throw new Error(
      `[${name}] Incorrect configuration: the \`activeBreakpoints\` and \`inactiveBreakpoints\` are not compatible.`,
    );
  }
}

/**
 * Add the current instance to the resize service.
 *
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
export function withBreakpointObserver<S extends Base>(
  BaseClass: typeof Base,
): BaseDecorator<WithBreakpointObserverInterface, S, WithBreakpointObserverProps> {
  /**
   * Class.
   */
  class WithBreakpointObserver<T extends BaseProps = BaseProps> extends BaseClass<
    T & WithBreakpointObserverProps
  > {
    /**
     * Config.
     */
    static config: BaseConfig = {
      ...BaseClass.config,
      name: `${BaseClass.config.name}WithBreakpointObserver`,
      options: {
        ...BaseClass.config?.options,
        activeBreakpoints: String,
        inactiveBreakpoints: String,
      },
    };

    /**
     * Watch for the document resize to test the breakpoints.
     */
    constructor(element: HTMLElement) {
      super(element);

      const { remove, props } = useResize();
      const { name } = this.$options;

      // Do nothing if no breakpoint has been defined.
      // @see https://js-toolkit.meta.fr/services/resize.html#breakpoint
      if (!props().breakpoint) {
        if (isDev) {
          throw new Error(
            `[${name}] The \`BreakpointObserver\` class requires breakpoints to be defined.`,
          );
        }
        return;
      }

      const key = `BreakpointObserver-${this.$id}`;
      const attributes = features.get('attributes');

      // Watch change on the `data-options` attribute to emit the `set:options` event.
      const mutationObserver = new MutationObserver(([mutation]) => {
        if (
          mutation.type === 'attributes' &&
          startsWith(mutation.attributeName, `${attributes.option}-`)
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
     */
    async $mount() {
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
  }

  // @ts-ignore
  return WithBreakpointObserver;
}
