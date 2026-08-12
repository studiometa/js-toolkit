import type { Base, BaseConstructor, BaseProps, MountedReturn } from '../Base.js';
import type { Service } from './service.js';

/**
 * Options every service mixin accepts, on top of the ones its service takes.
 */
export interface ServiceMixinOptions<Target, Host = Base> {
  /**
   * What to observe, resolved per instance. Defaults to the service's own
   * default target — the window, the viewport, the component's root element.
   */
  target?: (instance: Host) => Target;
}

/**
 * What a service declares to get a mixin.
 */
export interface ServiceMixinDefinition<Target, Options> {
  /** Default method name, e.g. `scrolled`. */
  hook: string;
  /** Default target, e.g. the window for the scroll service. */
  target: (instance: Base) => Target;
  /**
   * Service the method subscribes to. Both parameters are `unknown` here
   * because the mixin forwards whatever the hook returns without looking at
   * it — the frame service is the one that reads it.
   */
  use: (target: Target, options: Options) => Service<unknown, unknown>;
}

/**
 * The two forms a service mixin takes: applied to a class, or used as a
 * class decorator.
 *
 * The mixin form is the primitive because it needs no build step; the
 * decorator is sugar over it, the rule every decorator in this package
 * follows. Both return a subclass, so a component keeps its own props type
 * through `withScroll(Base)<MyProps>`.
 */
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

/**
 * The class a mixin hands back: the statics of the one it extends, and a
 * generic construct signature so the component keeps declaring its own props
 * — `class Slider extends withScroll(Base)<SliderProps>`.
 *
 * The statics are picked rather than intersected: two construct signatures
 * returning different types cannot be extended (TS2510).
 */
export type MixedClass<T extends BaseConstructor, Instance> = Pick<T, keyof T> & {
  new <P extends BaseProps = BaseProps>(el: HTMLElement): InstanceType<T> & Base<P> & Instance;
};

/**
 * Build the mixin a service exposes for its hook.
 *
 * **A hook is sugar for the default target.** `scrolled()` follows the
 * window, `dragged()` the component's own root — whatever the service
 * observes when called with no argument. Any other target is named in the
 * mixin's options, or subscribed by hand in `mounted()`, where the returned
 * unsubscribe is the cleanup:
 *
 *     mounted() {
 *       return useScroll(this.$refs.panel).subscribe((props) => { … });
 *     }
 *
 * There is one method name per service, and it is the service's own: two
 * layers of the same mixin on one class would collide on it, and a custom
 * name bought nothing but ways to go wrong — it lost the hook's props typing
 * entirely, and renaming it compiled, shipped, and silently stopped updating.
 * A second target is an explicit subscription in `mounted()`, as above.
 *
 * Both paths reach the same service. This is the line Lit draws as well,
 * where a `ResizeController`'s `target` defaults to the host and is
 * otherwise passed in — and it is why the wiring is a mixin rather than
 * something `Base` knows about: a hook adds public API to the component,
 * which is Lit's own criterion for choosing a mixin over a controller.
 *
 * Everything runs through the public lifecycle: the mixin overrides
 * `mounted()`, subscribes, and hands its unsubscribe back with the rest of
 * the cleanups. Per mount cycle therefore comes for free — a destroyed
 * instance leaves no subscription behind, and a remounted one subscribes
 * again, exactly once. A component overriding `mounted()` returns what it
 * extends along with its own cleanup, the usual mixin contract:
 *
 *     mounted() {
 *       return [super.mounted(), () => { … }];
 *     }
 *
 * **A mount cycle is not always the right span,** and when it is not, the hook
 * is the wrong tool: `toggle()` wraps a subscription the component starts and
 * stops itself, with no hook involved.
 */
export function createServiceMixin<Instance, Target, Options extends object = object>(
  definition: ServiceMixinDefinition<Target, Options & ServiceMixinOptions<Target>>,
): ServiceMixin<Instance, Target, Options> {
  type MixinOptions = Options & ServiceMixinOptions<Target>;

  function apply(BaseClass: BaseConstructor, options: MixinOptions) {
    const { hook } = definition;
    const target = options.target ?? definition.target;

    return class extends BaseClass {
      mounted(): MountedReturn {
        const inherited = super.mounted();
        const method = (this as unknown as Record<string, unknown>)[hook];
        // A component that does not implement the method subscribes to
        // nothing, so the service it would have started never runs. Read here
        // rather than at construction, because a hook written as a class field
        // does not exist yet while the fields are initialising.
        if (typeof method !== 'function') {
          return inherited;
        }
        // Everything goes through the public lifecycle, so per mount cycle
        // comes for free: a destroyed instance leaves no subscription behind,
        // and a remounted one subscribes again, exactly once.
        return [
          inherited,
          definition
            .use(target(this), options)
            .subscribe((props) => (method as (props: unknown) => unknown).call(this, props)),
        ];
      }
    };
  }

  return function mixin(first?: unknown, second?: unknown) {
    // A class as the first argument is the mixin form; anything else is the
    // decorator's options.
    if (typeof first === 'function') {
      return apply(first as BaseConstructor, (second ?? {}) as MixinOptions);
    }
    const options = (first ?? {}) as MixinOptions;
    return (value: BaseConstructor) => apply(value, options);
  } as unknown as ServiceMixin<Instance, Target, Options>;
}
