import type { Base, BaseConstructor, BaseProps, MountedReturn } from '../Base.js';
import type { Service } from './service.js';
import { toggle, type Toggle } from './toggle.js';

/**
 * Options every service mixin accepts, on top of the ones its service takes.
 */
export interface ServiceMixinOptions<Target, Host = Base> {
  /**
   * What to observe, resolved per instance. Defaults to the service's own
   * default target — the window, the viewport, the component's root element.
   */
  target?: (instance: Host) => Target;
  /** Do not subscribe on mount. Control the subscription through `this.$services.<hook>`. */
  manual?: boolean;
  /** Request current props when the subscription starts. */
  immediate?: boolean;
}

/** Typed service controls keyed by hook name. Stacked mixins accumulate keys. */
export type ServiceHandles<Hook extends string> = {
  readonly $services: { readonly [K in Hook]: Toggle };
};

/**
 * What a service declares to get a mixin.
 */
export interface ServiceMixinDefinition<Target, Options> {
  /** Default method name, e.g. `scrolled`. */
  hook: string;
  /** Default target, e.g. the window for the scroll service. */
  target: (instance: Base) => Target;
  /**
   * Whether a subscription asks for current props when the caller does not
   * choose. Most hooks wait for the next update; sources whose hook is about
   * current state can opt in while still honouring an explicit `false`.
   */
  defaultImmediate?: boolean;
  /**
   * Service the method subscribes to. Both parameters are `unknown` here
   * because most mixins forward whatever the hook returns without looking at
   * it — the frame service is the one that reads it.
   */
  use: (target: Target, options: Options) => Service<unknown, unknown>;
  /**
   * Adapt a hook result when the service itself does not own it. This keeps a
   * service-specific write convention in its definition without copying the
   * mixin lifecycle.
   */
  handleResult?: (instance: Base, result: unknown) => void;
}

/** A service mixin used directly or as a class decorator. */
export interface ServiceMixin<Instance, Target, Options extends object = object> {
  <T extends BaseConstructor>(
    BaseClass: T,
    options?: Options & ServiceMixinOptions<Target, InstanceType<T>>,
  ): MixedClass<T, Instance>;
  (
    options?: Options & ServiceMixinOptions<Target>,
  ): <T extends BaseConstructor>(
    value: T,
    context: ClassDecoratorContext<T>,
  ) => MixedClass<T, Instance>;
}

/** Mixed class statics and a generic constructor that preserves component props. */
export type MixedClass<T extends BaseConstructor, Instance> = Pick<T, keyof T> & {
  new <P extends BaseProps = BaseProps>(el: HTMLElement): InstanceType<T> & Base<P> & Instance;
};

/**
 * Build a lifecycle-bound service mixin. Automatic subscriptions last for one mount cycle. Manual subscriptions also stop on destroy or termination.
 */
export function createServiceMixin<Instance, Target, Options extends object = object>(
  definition: ServiceMixinDefinition<Target, Options & ServiceMixinOptions<Target>>,
): ServiceMixin<Instance, Target, Options> {
  type MixinOptions = Options & ServiceMixinOptions<Target>;

  function apply(BaseClass: BaseConstructor, options: MixinOptions) {
    const { hook } = definition;
    const target = options.target ?? definition.target;
    const isManual = options.manual ?? false;

    return class extends BaseClass {
      constructor(el: HTMLElement) {
        super(el);
        const host = this as unknown as {
          $services?: Record<string, Toggle>;
          $isTerminated: boolean;
        };
        // Share one handle object across stacked mixins.
        const services = (host.$services ??= {});
        const handle = toggle(() => {
          const method = (this as unknown as Record<string, unknown>)[hook];
          // Resolve the hook when subscribing because class fields initialize after `super()`.
          if (typeof method !== 'function') {
            return () => {};
          }
          return definition.use(target(this), options).subscribe(
            (props) => {
              const result = (method as (props: unknown) => unknown).call(this, props);
              if (definition.handleResult) {
                definition.handleResult(this, result);
                return undefined;
              }
              return result;
            },
            { immediate: options.immediate ?? definition.defaultImmediate ?? false },
          );
        });

        services[hook] = {
          get isActive() {
            return handle.isActive;
          },
          // A terminated instance never mounts again, so nothing would ever
          // release the subscription this would start.
          start: () => {
            if (!host.$isTerminated) {
              handle.start();
            }
          },
          stop: handle.stop,
        };
      }

      mounted(): MountedReturn {
        const inherited = super.mounted();
        const handle = (this as unknown as { $services: Record<string, Toggle> }).$services[hook];
        if (!isManual) {
          handle.start();
        }
        // `stop` is bound and idempotent.
        return [inherited, handle.stop];
      }

      $terminate(): this {
        // Stop a manual subscription that started outside a mount cycle.
        (this as unknown as { $services: Record<string, Toggle> }).$services[hook].stop();
        return super.$terminate() as this;
      }
    };
  }

  return function mixin(first?: unknown, second?: unknown) {
    // A class selects mixin form; other values select decorator options.
    if (typeof first === 'function') {
      return apply(first as BaseConstructor, (second ?? {}) as MixinOptions);
    }
    const options = (first ?? {}) as MixinOptions;
    return (value: BaseConstructor) => apply(value, options);
  } as unknown as ServiceMixin<Instance, Target, Options>;
}
