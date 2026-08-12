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
  /**
   * Method the component implements. Defaults to the service's hook name, so
   * applying the mixin twice with two names subscribes twice.
   */
  hook?: string;
  /**
   * Declare the hook without subscribing it: `mounted()` leaves it off, and
   * the component turns it on and off itself with `$enable(hook)` /
   * `$disable(hook)`.
   *
   * This is what keeps a service honest about doing no work while nobody
   * needs it — a component that only wants the frame loop while a value
   * settles releases it as soon as it has, instead of holding the loop open
   * for the lifetime of the page.
   */
  manual?: boolean;
}

/**
 * The v3 `$services.enable()` / `.disable()` verbs, on the instance: a
 * subscription can be suspended and resumed **within** one mount cycle.
 *
 * Both are safe before mount and after destroy, and `$enable()` is
 * idempotent — a hook cannot end up subscribed twice.
 */
export interface ServiceControls {
  /** Subscribe the named hook now, if it is not subscribed already. */
  $enable(hook: string): void;
  /** Release the named hook's subscription, if it has one. */
  $disable(hook: string): void;
}

interface ServiceSubscription {
  /** Subscribe, returning the unsubscribe. */
  subscribe(): () => void;
  /** The live unsubscribe, or `null` while the hook is suspended. */
  unsubscribe: (() => void) | null;
}

/**
 * Per-instance `hook → subscription` map, filled by each mixin layer at
 * construction. It is shared by every layer, so `$enable('scrolled')` called
 * on a class built from stacked mixins finds the layer that owns the hook.
 */
const SERVICE_SUBSCRIPTIONS: unique symbol = /* @__PURE__ */ Symbol('service subscriptions');

type WithSubscriptions = { [SERVICE_SUBSCRIPTIONS]?: Map<string, ServiceSubscription> };

function subscriptionsOf(instance: unknown): Map<string, ServiceSubscription> {
  const host = instance as WithSubscriptions;
  return (host[SERVICE_SUBSCRIPTIONS] ??= new Map());
}

function enableHook(instance: unknown, hook: string): void {
  const subscription = subscriptionsOf(instance).get(hook);
  if (!subscription) {
    console.warn(`[service] No service mixin declares a "${hook}" hook on this component.`);
    return;
  }
  // A terminated instance never mounts again, so nothing would ever release
  // the subscription this would start.
  if ((instance as Base).$isTerminated) {
    return;
  }
  // Idempotent: an already-running hook keeps its one subscription.
  subscription.unsubscribe ??= subscription.subscribe();
}

function disableHook(instance: unknown, hook: string): void {
  const subscription = subscriptionsOf(instance).get(hook);
  if (!subscription) {
    return;
  }
  subscription.unsubscribe?.();
  subscription.unsubscribe = null;
}

/**
 * What a service declares to get a mixin.
 */
export interface ServiceMixinDefinition<Target, Options> {
  /** Default method name, e.g. `scrolled`. */
  hook: string;
  /** Default target, e.g. the window for the scroll service. */
  target: (instance: Base) => Target;
  /** Service the method subscribes to. */
  use: (target: Target, options: Options) => Service<unknown>;
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
  new <P extends BaseProps = BaseProps>(
    el: HTMLElement,
  ): InstanceType<T> & Base<P> & Instance & ServiceControls;
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
 *       return useScroll(this.$refs.panel).add((props) => { … });
 *     }
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
 * **A mount cycle is not always the right span.** `{ manual: true }` declares
 * the hook without subscribing it, and the component decides — the v3
 * `$services.enable()`/`.disable()` pair, on the instance:
 *
 *     class SliderItem extends withRaf(Base, { manual: true }) {
 *       ticked() { … }
 *       onIndexChange() { this.$enable('ticked'); }
 *       onSettled() { this.$disable('ticked'); }
 *     }
 *
 * Either way the subscription is released on destroy, so a suspended service
 * with no other subscriber genuinely stops: no listener, no observer, no
 * frame.
 */
export function createServiceMixin<Instance, Target, Options extends object = object>(
  definition: ServiceMixinDefinition<Target, Options & ServiceMixinOptions<Target>>,
): ServiceMixin<Instance, Target, Options> {
  type MixinOptions = Options & ServiceMixinOptions<Target>;

  function apply(BaseClass: BaseConstructor, options: MixinOptions) {
    const hook = options.hook ?? definition.hook;
    const target = options.target ?? definition.target;
    const isManual = options.manual ?? false;

    return class extends BaseClass {
      constructor(el: HTMLElement) {
        super(el);
        // Declared at construction, so `$enable()` works before the first
        // mount and finds the right layer when mixins are stacked.
        subscriptionsOf(this).set(hook, {
          unsubscribe: null,
          subscribe: () => {
            const method = (this as unknown as Record<string, unknown>)[hook];
            // A component that does not implement the method subscribes to
            // nothing, so the service it would have started never runs.
            if (typeof method !== 'function') {
              return () => {};
            }
            return definition
              .use(target(this), options)
              .add((props) => (method as (props: unknown) => unknown).call(this, props));
          },
        });
      }

      mounted(): MountedReturn {
        const inherited = super.mounted();
        if (!isManual) {
          enableHook(this, hook);
        }
        // Released with the mount cycle whichever side subscribed it — the
        // mixin above, or the component through `$enable()`. The subscription
        // is synchronous, so an async `super.mounted()` only defers its own
        // cleanup, never this one.
        return [inherited, () => disableHook(this, hook)];
      }

      $enable(name: string): void {
        enableHook(this, name);
      }

      $disable(name: string): void {
        disableHook(this, name);
      }

      $terminate(): this {
        // `$destroy()` releases whatever was subscribed during a mount cycle;
        // this covers the instance that was enabled and never mounted.
        disableHook(this, hook);
        return super.$terminate() as this;
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
