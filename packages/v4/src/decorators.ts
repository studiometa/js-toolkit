import {
  HANDLER_REGISTRATIONS,
  type Base,
  type BaseConfig,
  type BaseConstructor,
  type ChildrenCollection,
  type DelegatedEvent,
  type HandlerRegistration,
  type WatchChildrenCallbacks,
} from './Base.js';
import { Signal, type ContextKey } from './context.js';
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
type ChildHandler<T extends Base = Base> = (this: any, payload: DelegatedEvent<T>) => void;

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
 * the magic `on<Child><Event>` method names:
 *
 *     class Accordion extends Base {
 *       // Delegated child event: no `config.components` needed to resolve
 *       // the name, no naming ambiguity, any event type.
 *       @on('AccordionItem', 'open')
 *       autoclose({ target }: DelegatedEvent<AccordionItem>) { … }
 *
 *       // Own event on the root element.
 *       @on('click')
 *       handleClick(event: Event) { … }
 *     }
 */
export function on(
  type: string,
): <This extends Base>(
  value: OwnHandler,
  context: ClassMethodDecoratorContext<This, OwnHandler>,
) => void;
export function on(
  child: string,
  type: string,
): <T extends Base, This extends Base>(
  value: ChildHandler<T>,
  context: ClassMethodDecoratorContext<This, ChildHandler<T>>,
) => void;
export function on(childOrType: string, maybeType?: string) {
  const child = maybeType === undefined ? null : childOrType;
  const type = maybeType ?? childOrType;
  return function decorate(
    value: HandlerRegistration['handler'],
    context: ClassMethodDecoratorContext<any, any>,
  ): void {
    context.addInitializer(function initialize(this: Base) {
      (this[HANDLER_REGISTRATIONS] ??= []).push({ child, type, handler: value });
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
 * Provide the decorated signal to the subtree (nearest provider wins) — the
 * field-decorator form of `$provide()`:
 *
 *     class Slider extends Base {
 *       @provide(SliderContext)
 *       state = new Signal({ index: 0, total: 0 });
 *     }
 *
 * A plain value is wrapped in a `Signal` automatically.
 */
export function provide<T>(key: ContextKey<T>): ValueDecorator<Signal<T>> {
  return function decorate<This extends Base>(
    _target: unknown,
    context: ValueDecoratorContext<This, Signal<T>>,
  ) {
    return withInitializer(context, function initialize(this: This, initial: Signal<T>) {
      return this.$provide(key, initial);
    });
  } as ValueDecorator<Signal<T>>;
}

/**
 * Resolve the nearest provided signal into the decorated field, now or when a
 * provider appears — the field stays `undefined` until then (the
 * field-decorator form of `$inject()`, shaped like Lit's `@consume`):
 *
 *     class SliderCount extends Base {
 *       @inject(SliderContext)
 *       state?: Signal<SliderState>;
 *     }
 */
export function inject<T>(key: ContextKey<T>): ValueObserver<Signal<T> | undefined> {
  return function decorate<This extends Base>(
    _target: unknown,
    context: ValueDecoratorContext<This, Signal<T> | undefined>,
  ): void {
    context.addInitializer(function initialize(this: This) {
      this.$inject(key).then((signal) => {
        context.access.set(this, signal);
      });
    });
  } as ValueObserver<Signal<T> | undefined>;
}

/**
 * Track the mounted descendants of a name as a live collection — the
 * field-decorator form of `$watchChildren()`. Callbacks are bound to the
 * instance, so `this` is the component:
 *
 *     class Accordion extends Base {
 *       @children<AccordionItem>('AccordionItem', {
 *         added() { this.sync(); },
 *       })
 *       items!: ChildrenCollection<AccordionItem>;
 *     }
 */
export function children<T extends Base = Base, Host = any>(
  name: string,
  callbacks?: WatchChildrenCallbacks<T> & ThisType<Host>,
): ValueDecorator<ChildrenCollection<T>> {
  return function decorate<This extends Base>(
    _target: unknown,
    context: ValueDecoratorContext<This, ChildrenCollection<T>>,
  ) {
    return withInitializer(context, function initialize(this: This) {
      const bound = callbacks && {
        added: callbacks.added?.bind(this as never),
        removed: callbacks.removed?.bind(this as never),
      };
      return this.$watchChildren<T>(name, bound);
    });
  } as ValueDecorator<ChildrenCollection<T>>;
}
