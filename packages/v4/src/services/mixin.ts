import type { Base, BaseConstructor, BaseProps } from '../Base.js';
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

/**
 * The keys of {@link ServiceMixinOptions}. They describe the subscription, not
 * the observation, so they belong to the mixin and never to the service.
 */
const MIXIN_OPTIONS: readonly string[] = ['target', 'manual', 'immediate'];

/**
 * Split the service half out of what the caller wrote.
 *
 * A service is identified by the options it is handed, so a lifecycle key
 * reaching `use()` mints a service of its own: `withDrag(Base, { manual: true })`
 * bound a second drag service on the element the plain `withDrag(Base)` already
 * owned — two pointer listener sets, two window listener sets and two
 * `touch-action` claims. `Options` no longer holds those keys either, so
 * forwarding the whole object is now the correct call rather than the mistake.
 *
 * A key holding `undefined` goes with them: naming an option without a value
 * is the same request as not naming it, and the service key already reads it
 * that way.
 */
function serviceOptionsOf<Options extends object, Target>(
  options: Options & ServiceMixinOptions<Target>,
): Options {
  const source = options as Record<string, unknown>;
  const serviceOptions: Record<string, unknown> = {};
  for (const key of Object.keys(source)) {
    if (source[key] !== undefined && !MIXIN_OPTIONS.includes(key)) {
      serviceOptions[key] = source[key];
    }
  }
  return serviceOptions as Options;
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
   * Service the method subscribes to, given the service half of the options.
   *
   * `Options` is the service's own option type, without the mixin's `target`,
   * `manual` and `immediate`: they are stripped before the call and absent
   * from the type, so forwarding the whole object cannot put a lifecycle
   * choice into the service identity.
   *
   * Both service parameters are `unknown` here because most mixins forward
   * whatever the hook returns without looking at it — the frame service is the
   * one that reads it.
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
  definition: ServiceMixinDefinition<Target, Options>,
): ServiceMixin<Instance, Target, Options> {
  type MixinOptions = Options & ServiceMixinOptions<Target>;

  function apply(BaseClass: BaseConstructor, options: MixinOptions) {
    const { hook } = definition;
    const target = options.target ?? definition.target;
    const isManual = options.manual ?? false;
    // One split per applied mixin: every instance asks for the same service.
    const serviceOptions = serviceOptionsOf<Options, Target>(options);

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
          return definition.use(target(this), serviceOptions).subscribe(
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

      /**
       * Bind from `$mount()` rather than from `mounted()`.
       *
       * `mounted()` belongs to the component author. A mixin which occupied it
       * needed every subclass to chain `super.mounted()`, and forgetting was
       * total and silent: the subscription simply never happened, with no
       * warning, no type error and no failing hook. `$mount()` is the
       * framework's own method — the one `$terminate()` already overrides —
       * so there is nothing left to chain.
       *
       * The subscription therefore starts once the whole `mounted()` has run,
       * which is also when an `immediate` first delivery reaches a component
       * that is fully set up. `$isMounted` is the guard: a hook that
       * terminated the instance, or threw, leaves nothing to subscribe for.
       */
      $mount(): this {
        super.$mount();
        if (!isManual && this.$isMounted) {
          (this as unknown as { $services: Record<string, Toggle> }).$services[hook].start();
        }
        return this;
      }

      /**
       * Release before the cycle unwinds, so `destroyed()` sees the same
       * stopped subscription it saw when the release was a mount cleanup.
       */
      $destroy(): this {
        if (this.$isMounted) {
          // `stop` is bound and idempotent.
          (this as unknown as { $services: Record<string, Toggle> }).$services[hook].stop();
        }
        return super.$destroy();
      }

      $terminate(): this {
        // Stop a manual subscription that started outside a mount cycle.
        (this as unknown as { $services: Record<string, Toggle> }).$services[hook].stop();
        return super.$terminate();
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
