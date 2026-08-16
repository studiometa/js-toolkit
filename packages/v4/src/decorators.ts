import {
  type Base,
  type BaseConfig,
  type BaseConstructor,
  type ChildrenCollection,
  type DelegatedEvent,
  type GlobalEvent,
  type HandlerRegistration,
  type RefEvent,
  resolveConfig,
  type WatchChildrenCallbacks,
} from './Base.js';
import { isBaseConstructor } from './component-brand.js';
import type { ContextKey } from './context.js';
import { HANDLER_REGISTRATIONS } from './protocol-symbols.js';
import { registerComponent } from './registry.js';

/** Decorator syntax requires transpilation; use the function APIs without a build step. */

// The decorator cannot know the host class of a decorated method.
type OwnHandler = (this: any, event: Event) => void;
type ChildHandler<T extends Base = Base, K extends string = string> = (
  this: any,
  payload: DelegatedEvent<T, K>,
) => void;
type RefHandler<T extends HTMLElement = HTMLElement> = (this: any, payload: RefEvent<T>) => void;
type GlobalHandler<T extends Event = Event> = (this: any, payload: GlobalEvent<T>) => void;

/** Maps known global event names to their platform type and custom names to `Event`. */
type PlatformEvent<M, K extends string> = K extends keyof M
  ? M[K] extends Event
    ? M[K]
    : Event
  : Event;

type OnTarget = string | BaseConstructor | typeof window | typeof document;

/**
 * Global targets use identity checks. Component classes use their merged config name because it is their mount identity.
 * Other `EventTarget` values are invalid because decorators have no component instance or mount cycle.
 */
function resolveHandlerTarget(
  target: OnTarget,
  maybeType?: string,
): Omit<HandlerRegistration, 'handler'> {
  if (typeof target === 'string') {
    return maybeType === undefined
      ? { target: null, child: null, type: target }
      : { target: null, child: target, type: maybeType };
  }

  if (maybeType === undefined) {
    throw new TypeError('[@on] a target value must be followed by an event type.');
  }

  if (isBaseConstructor(target)) {
    return { target: null, child: resolveConfig(target).name, type: maybeType };
  } else if (target === window || target === document) {
    return { target, child: null, type: maybeType };
  }

  throw new TypeError(
    '[@on] the target must be a child name, a component class, `window` or `document`. ' +
      'Bind any other EventTarget from `mounted()`, where the instance and its cleanup exist.',
  );
}

/** A value decorator for a field or an `accessor` field. */
type ValueDecoratorContext<This, Value> =
  | ClassFieldDecoratorContext<This, Value>
  | ClassAccessorDecoratorContext<This, Value>;

interface ValueDecorator<Value> {
  <This extends Base>(
    target: undefined,
    context: ClassFieldDecoratorContext<This, Value>,
  ): (this: This, initial: Value) => Value;
  <This extends Base>(
    target: ClassAccessorDecoratorTarget<This, Value>,
    context: ClassAccessorDecoratorContext<This, Value>,
  ): ClassAccessorDecoratorResult<This, Value>;
}

interface ValueObserver<Value> {
  <This extends Base>(target: undefined, context: ClassFieldDecoratorContext<This, Value>): void;
  <This extends Base>(
    target: ClassAccessorDecoratorTarget<This, Value>,
    context: ClassAccessorDecoratorContext<This, Value>,
  ): void;
}

function withInitializer<This extends Base, Value>(
  context: ValueDecoratorContext<This, Value>,
  initialize: (this: This, initial: Value) => Value,
) {
  return context.kind === 'accessor' ? { init: initialize } : initialize;
}

/**
 * Decorate a method as an event handler.
 * One string binds an event on the component root. A string and event type bind a child or ref.
 * A component class binds that child type. `window` and `document` bind global events.
 */
export function on(
  type: string,
): <This extends Base>(
  value: OwnHandler,
  context: ClassMethodDecoratorContext<This, OwnHandler>,
) => void;
export function on<K extends string>(
  target: typeof window,
  type: K,
): <This extends Base>(
  value: GlobalHandler<PlatformEvent<WindowEventMap, K>>,
  context: ClassMethodDecoratorContext<This, GlobalHandler<PlatformEvent<WindowEventMap, K>>>,
) => void;
export function on<K extends string>(
  target: typeof document,
  type: K,
): <This extends Base>(
  value: GlobalHandler<PlatformEvent<DocumentEventMap, K>>,
  context: ClassMethodDecoratorContext<This, GlobalHandler<PlatformEvent<DocumentEventMap, K>>>,
) => void;
export function on<T extends BaseConstructor, K extends string>(
  child: T,
  type: K,
): <This extends Base>(
  value: ChildHandler<InstanceType<T>, K>,
  context: ClassMethodDecoratorContext<This, ChildHandler<InstanceType<T>, K>>,
) => void;
/** A string target can be a child or ref. Ref names must include the `[]` suffix declared in `config.refs`. */
export function on(
  child: string,
  type: string,
): <T extends Base, E extends HTMLElement, This extends Base>(
  value: ChildHandler<T> | RefHandler<E>,
  context: ClassMethodDecoratorContext<This, ChildHandler<T> | RefHandler<E>>,
) => void;
export function on(target: OnTarget, maybeType?: string) {
  const registration = resolveHandlerTarget(target, maybeType);
  return function decorate(
    value: HandlerRegistration['handler'],
    context: ClassMethodDecoratorContext<any, any>,
  ): void {
    context.addInitializer(function initialize(this: Base) {
      (this[HANDLER_REGISTRATIONS] ??= []).push({ ...registration, handler: value });
    });
  };
}

type VoidMethod<This, Args extends unknown[]> = (this: This, ...args: Args) => void;

function inPhase(phase: '$read' | '$write') {
  return function decorate<This extends Base, Args extends unknown[]>(
    value: VoidMethod<This, Args>,
    _context: ClassMethodDecoratorContext<This, VoidMethod<This, Args>>,
  ): VoidMethod<This, Args> {
    return function scheduled(this: This, ...args: Args) {
      this[phase](() => value.apply(this, args));
    };
  };
}

/** Schedule the method body in the next read phase. Destruction cancels pending work. */
export const read = inPhase('$read');

/** Schedule the method body in the next write phase. Destruction cancels pending work. */
export const write = inPhase('$write');

/** Set the component config and register the class when it is defined. */
export function component(config: BaseConfig) {
  return function decorate<T extends BaseConstructor>(
    value: T,
    context: ClassDecoratorContext<T>,
  ): void {
    // Copying the inherited config adds nothing to the merged one —
    // `resolveConfig()` walks the prototype chain — but `isBaseConstructor()`
    // reads `config.name` straight off the class, and cannot call
    // `resolveConfig()` because `Base` imports the brand. A config written
    // without a name, as an untyped subclass adding config to its parent's
    // does, would leave the class registered under the name it inherited yet
    // rejected by every brand check: `config.components` entries,
    // `@on(Class, type)` and lazy import resolution.
    value.config = { ...value.config, ...config };
    context.addInitializer(function initialize(this: T) {
      registerComponent(this);
    });
  };
}

/** Provide the decorated field to descendants. The nearest provider wins. */
export function provide<T>(key: ContextKey<T>): ValueDecorator<T> {
  return function decorate<This extends Base>(
    _target: unknown,
    context: ValueDecoratorContext<This, T>,
  ) {
    return withInitializer(context, function initialize(this: This, initial: T) {
      return this.$provide(key, initial);
    });
  } as ValueDecorator<T>;
}

/**
 * Resolve the nearest provided value into the decorated field. The field stays `undefined` until resolution.
 * Resolution starts once at construction and does not restart after destruction.
 */
export function inject<T>(key: ContextKey<T>): ValueObserver<T | undefined> {
  return function decorate<This extends Base>(
    _target: unknown,
    context: ValueDecoratorContext<This, T | undefined>,
  ): void {
    context.addInitializer(function initialize(this: This) {
      this.$inject(key).then((value) => {
        context.access.set(this, value);
      });
    });
  } as ValueObserver<T | undefined>;
}

/**
 * Track mounted descendants as a live collection. Strings match `config.name` exactly.
 * Component classes include named subclasses. Callbacks bind to the host component.
 */
export function children<T extends Base = Base, Host = any>(
  name: string,
  callbacks?: WatchChildrenCallbacks<T> & ThisType<Host>,
): ValueDecorator<ChildrenCollection<T>>;
export function children<T extends BaseConstructor, Host = any>(
  ComponentClass: T,
  callbacks?: WatchChildrenCallbacks<InstanceType<T>> & ThisType<Host>,
): ValueDecorator<ChildrenCollection<InstanceType<T>>>;
export function children(
  target: string | BaseConstructor,
  callbacks?: WatchChildrenCallbacks & ThisType<any>,
): ValueDecorator<ChildrenCollection> {
  return function decorate<This extends Base>(
    _target: unknown,
    context: ValueDecoratorContext<This, ChildrenCollection>,
  ) {
    return withInitializer(context, function initialize(this: This) {
      const bound = callbacks && {
        added: callbacks.added?.bind(this as never),
        removed: callbacks.removed?.bind(this as never),
      };
      return typeof target === 'string'
        ? this.$watchChildren(target, bound)
        : this.$watchChildren(target, bound);
    });
  } as ValueDecorator<ChildrenCollection>;
}
