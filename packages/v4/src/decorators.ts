import {
  HANDLER_REGISTRATIONS,
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
import { registerComponent } from './registry.js';

/**
 * Stage-3 decorators are optional sugar over the function API: no engine
 * ships them yet, so they require a build step — the function forms
 * (`registerComponent`, `$provide`, `$watchChildren`, magic `on<…>` method
 * names) remain the no-build path.
 */

// `this: any` keeps the handler assignable whatever the host class is: the
// decorated method is typed by its own class, which the decorator cannot know.
type OwnHandler = (this: any, event: Event) => void;
type ChildHandler<T extends Base = Base, K extends string = string> = (
  this: any,
  payload: DelegatedEvent<T, K>,
) => void;
type RefHandler<T extends HTMLElement = HTMLElement> = (this: any, payload: RefEvent<T>) => void;
type GlobalHandler<T extends Event = Event> = (this: any, payload: GlobalEvent<T>) => void;

/**
 * The event a name maps to on a global target — `MouseEvent` for `click`,
 * `Event` for a custom name the platform's map does not know, so a
 * `@on(window, 'my-app:ready')` still types rather than collapsing to `any`.
 */
type PlatformEvent<M, K extends string> = K extends keyof M
  ? M[K] extends Event
    ? M[K]
    : Event
  : Event;

/** Everything `@on` accepts as a target. */
type OnTarget = string | BaseConstructor | typeof window | typeof document;

/**
 * Split `@on`'s arguments into the record `#bindHandlers()` consumes.
 *
 * `window` and `document` are matched **by identity**, so they resolve to the
 * same binding the reserved `onWindow<Event>` / `onDocument<Event>` names use.
 * Nothing is encoded into `child`: the target travels as itself, so no string
 * is reserved and `@on('Window', 'resize')` keeps meaning a child named
 * `Window`.
 *
 * A component class resolves through `resolveConfig()` rather than through its
 * own `config.name`. The merged config is what the instance mounts under, so
 * it is by definition the key the delegation walk looks up on `el.__base__`;
 * the class's own `config.name` only happens to agree, because `BaseConfig`
 * makes `name` required and the most derived declaration wins. Reading the
 * merged config makes the class form resolve to the mount identity by
 * construction instead of by coincidence, and it is the same cached lookup
 * `$config` performs.
 *
 * **Any other `EventTarget` is refused** — by the overloads for typed callers,
 * and here for the untyped path. It is not a gap. A decorator is evaluated
 * once, at class definition, with no instance and no document: an arbitrary
 * target can therefore only be a module-scope value shared by every instance
 * of the class, which is not what a per-mount-cycle listener means. A ref is
 * already covered by the string form, and anything else is one line in
 * `mounted()` — `addEventListener` plus the cleanup returned beside it —
 * scoped to the instance and to the cycle by the machinery that is already
 * there.
 */
function resolveHandlerTarget(
  target: OnTarget,
  maybeType?: string,
): Omit<HandlerRegistration, 'handler'> {
  if (typeof target === 'string') {
    // One argument names an own event on the root element; two make the
    // first argument the child or ref name.
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

/**
 * A value decorator usable on a plain field or on an `accessor` field: the
 * two differ only in how the initializer is handed back to the runtime (a
 * bare function for a field, an `{ init }` object for an accessor).
 */
type ValueDecoratorContext<This, Value> =
  | ClassFieldDecoratorContext<This, Value>
  | ClassAccessorDecoratorContext<This, Value>;

/**
 * The overloaded shape TypeScript expects from a decorator that works on
 * both a plain field and an `accessor` field.
 */
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

/**
 * A decorator that only reacts to construction, with nothing to hand back.
 */
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
 * Declare an event handler explicitly — a method decorator alternative to
 * the magic `on<Child><Event>` method names. The target comes first, as a
 * name or as the value itself:
 *
 *     class Accordion extends Base {
 *       // Delegated child event: no `config.components` needed to resolve
 *       // the name, no naming ambiguity, any event type.
 *       @on('AccordionItem', 'open')
 *       autoclose({ target }: DelegatedEvent<AccordionItem>) { … }
 *
 *       // The same child as a value. The class *is* the type, so `target`
 *       // and `payload` are typed from it with nothing to annotate.
 *       @on(AccordionItem, 'open')
 *       track({ target, payload }) { … }
 *
 *       // Global target — the decorator form of `onWindow<Event>` /
 *       // `onDocument<Event>`, and the very same listener behind it.
 *       @on(document, 'click')
 *       close({ event }: GlobalEvent<MouseEvent>) { … }
 *
 *       // Own event on the root element.
 *       @on('click')
 *       handleClick(event: Event) { … }
 *     }
 *
 * Taking the value is what gives the global form a spelling at all: a string
 * `'window'` would have to be reserved, and would then compete with a ref or
 * a component genuinely named `window`. Nothing is reserved here, so the
 * string forms keep their meaning beside the value forms — `@on('Window',
 * 'resize')` is still a child named `Window` — and a component that is not
 * imported is still reachable by name, which is what the autoload path and
 * the bundle size depend on. A child declared lazily, as
 * `Child: () => import('./Child.js')`, is exactly that case: the class form
 * would import the chunk the thunk exists to defer, so the string form is
 * the one to use. The thunk itself is not a target — it is a function with
 * no `config`, refused by the overloads and at runtime.
 *
 * An `EventTarget` that is none of these is rejected; see
 * `resolveHandlerTarget()` for why, and for the one line that replaces it.
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
/**
 * A name is a child **or** a ref — `#bindHandlers()` resolves either, children
 * first — and only the author knows which, so the handler is typed as either.
 * The class form has no such doubt: a class can only be a child.
 *
 * A ref is named the way `config.refs` declares it, `[]` included:
 * `@on('dots[]', 'click')` for a `dots[]` declaration, one spelling and not
 * two. `$refs.dots` and `onDotsClick()` derive a name from that declaration
 * and drop the suffix; `@on()` refers to the entry itself, like the
 * `data-ref="dots[]"` attribute, so it keeps it.
 */
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

/**
 * Run the method body in the scheduler's `read` phase, so its layout
 * measurements batch with every other read of the frame:
 *
 *     @read
 *     measure() { this.width = this.$el.getBoundingClientRect().width; }
 *
 * The call schedules and returns immediately; the task is canceled if the
 * instance is destroyed first. Use `this.$read()` directly when the task
 * handle or the return value is needed.
 */
export const read = inPhase('$read');

/**
 * Run the method body in the scheduler's `write` phase, so its DOM writes
 * batch after every read of the frame:
 *
 *     @write
 *     open() { this.$el.open = true; }
 *
 * The call schedules and returns immediately; the task is canceled if the
 * instance is destroyed first. Use `this.$write()` directly when the task
 * handle is needed.
 */
export const write = inPhase('$write');

/**
 * Declare the component's config and register it with the registry as soon
 * as the class is defined — the decorator form of `static config` +
 * `registerComponent()`:
 *
 *     @component({ name: 'Reveal' })
 *     class Reveal extends Base { … }
 */
export function component(config: BaseConfig) {
  return function decorate<T extends BaseConstructor>(
    value: T,
    context: ClassDecoratorContext<T>,
  ): void {
    value.config = { ...value.config, ...config };
    context.addInitializer(function initialize(this: T) {
      registerComponent(this);
    });
  };
}

/**
 * Provide the decorated field to the subtree (nearest provider wins) — the
 * field-decorator form of `$provide()`. The value is provided verbatim, so
 * the field is whatever the key declares: a `Signal` for reactive state, an
 * object of commands for an owner surface, an object of Signals for both.
 *
 *     class Slider extends Base {
 *       @provide(SliderContext)
 *       api = { state: signal({ index: 0, total: 0 }), goNext: () => this.goNext() };
 *     }
 */
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
 * Resolve the nearest provided value into the decorated field, now or when a
 * provider appears — the field stays `undefined` until then (the
 * field-decorator form of `$inject()`, shaped like Lit's `@consume`):
 *
 *     class SliderCount extends Base {
 *       @inject(SliderContext)
 *       accessor api: SliderApi | undefined;
 *     }
 *
 * The request is issued once, at construction, and is destroy-scoped like
 * `$inject()`: a field still unresolved when the instance is destroyed is not
 * requested again on remount. A consumer that may outlive several cycles
 * waiting for its provider calls `$inject()` from `mounted()` instead.
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
 * Track mounted descendants as a live collection — the field-decorator form
 * of `$watchChildren()`. A string matches `config.name` exactly. A component
 * class includes its named subclasses and infers the collection and callback
 * instance type. Callbacks are bound to the host component:
 *
 *     class Accordion extends Base {
 *       @children(AccordionItem, {
 *         added(item) { this.sync(item); },
 *       })
 *       accessor items!: ChildrenCollection<AccordionItem>;
 *     }
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
