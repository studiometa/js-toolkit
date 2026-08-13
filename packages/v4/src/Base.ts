import {
  injectContext,
  injectContextSync,
  provideContext,
  type ContextKey,
  type InjectContextOptions,
} from './context.js';
import { domVersion } from './dom-mutations.js';
import {
  domUpdate,
  emitExtendable,
  DOM_UPDATE_EVENT,
  type DomMutation,
} from './negotiated-events.js';
import { DESTROYED_EVENT, MOUNTED_EVENT } from './lifecycle-events.js';
import { defaultScheduler, type ScheduledTask } from './scheduler.js';
import type { MountStrategy } from './mount-strategies.js';
import { selectorFor } from './utils/selectors.js';
import { kebabCase, pascalCase } from './utils/strings.js';
import { viewTransition, type ViewTransitionUpdate } from './viewTransition.js';

export const SOURCE: unique symbol = Symbol('emitter');
export { DESTROYED_EVENT, MOUNTED_EVENT };

const REGEX_HANDLER = /^on[A-Z]/;

export type OptionType =
  | typeof String
  | typeof Number
  | typeof Boolean
  | typeof Array
  | typeof Object;

/**
 * The value an option of a given type holds.
 */
type OptionValue<T extends OptionType> = T extends typeof String
  ? string
  : T extends typeof Number
    ? number
    : T extends typeof Boolean
      ? boolean
      : T extends typeof Array
        ? unknown[]
        : Record<string, unknown>;

/**
 * `default` is a value, or a **factory** called once per instance.
 *
 * A factory is the only form `Array` and `Object` accept, and the reason is
 * the bug it prevents: a default declared as `default: {}` lives on the class,
 * so every instance of the component would read — and mutate — the same
 * object. `Function` is not an `OptionType`, so a function default is
 * unambiguously a factory.
 *
 *     options: {
 *       speed: { type: Number, default: 1 },
 *       tween: { type: Object, default: () => ({ ease: 'linear' }) },
 *     }
 */
type TypedOptionDefinition<T extends OptionType = OptionType> = T extends OptionType
  ? T extends typeof Array | typeof Object
    ? { type: T; default?: () => OptionValue<T> }
    : { type: T; default?: OptionValue<T> | (() => OptionValue<T>) }
  : never;

export type OptionDefinition = OptionType | TypedOptionDefinition;

export interface OptionChange<T = unknown> {
  name: string;
  value: T;
  previousValue: T | undefined;
  rawValue: string | null;
  previousRawValue: string | null;
  initial: boolean;
}

export type OptionChangedReturn = void | (() => void);

export interface BaseConfig {
  name: string;
  components?: Record<string, BaseConstructor>;
  refs?: string[];
  options?: Record<string, OptionDefinition>;
  /**
   * When instances of this component mount. Defaults to `eager`; an
   * element's `data-mount` attribute overrides it.
   */
  mountStrategy?: MountStrategy;
}

/**
 * Any component class. Declared structurally rather than as `typeof Base`,
 * so a component that types its props — `class Foo extends Base<{…}>` —
 * still satisfies it.
 */
export interface BaseConstructor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (el: HTMLElement): Base<any>;
  config: BaseConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly prototype: Base<any>;
}

/**
 * Payload given to delegated `on<Child><Event>` handlers.
 *
 * `payload` is the event's `detail`, unchanged — what a plain listener on the
 * page reads. Naming the event as the second parameter types it from the
 * child's `$emits` declaration, so a handler reads its fields without casting:
 *
 *     onSliderBtnSlide({ payload: { direction } }: DelegatedEvent<SliderBtn, 'slide'>) {}
 */
export interface DelegatedEvent<T extends Base = Base, K extends string = string> {
  event: Event;
  target: T;
  payload: EmitDetail<PropsOf<T>, K>;
}

/**
 * Payload given to `on<Ref><Event>` handlers. `index` is the ref's position
 * among the same-named refs, so a list of buttons can be told apart.
 */
export interface RefEvent<T extends HTMLElement = HTMLElement> {
  event: Event;
  target: T;
  index: number;
}

/**
 * Events that do not bubble, so their delegated listener must be registered
 * in the capture phase to be reached at all.
 */
const CAPTURED_EVENTS = new Set([
  'blur',
  'focus',
  'load',
  'error',
  'scroll',
  'mouseenter',
  'mouseleave',
  'pointerenter',
  'pointerleave',
]);

/**
 * Type-level description of a component's public surface. Nothing here
 * exists at runtime — declaring it costs no bytes:
 *
 *     class Slider extends Base<{
 *       $el: HTMLFormElement;
 *       $refs: { wrapper: HTMLElement; slides: HTMLElement[] };
 *       $options: { autoplay: boolean };
 *       $emits: { slide: { index: number }; stop: void };
 *     }> {}
 *
 * `$el` narrows the root element for a component that only makes sense on
 * one tag — a `<details>`, a `<form>` — so its members are reachable
 * without casting. `$emits` maps each event name to the **payload object**
 * `$emit()` carries for it — `void` for an event that carries nothing — and
 * replaces v3's runtime `config.emits` array: it documents what the component
 * dispatches and types `$emit()`, with nothing left in the bundle.
 *
 * Each declaration is the author's assertion about their own markup: the
 * registry mounts whatever element matched the selector, so a mismatch
 * surfaces at runtime, not here.
 */
export interface BaseProps {
  $el?: HTMLElement;
  $refs?: Record<string, HTMLElement | HTMLElement[]>;
  $options?: Record<string, unknown>;
  $emits?: EmitMap;
}

/**
 * What `$emits` maps an event name to: the payload object the event carries,
 * or `void` for one that carries nothing.
 */
export type EmitMap = Record<string, object | void>;

type El<T extends BaseProps> = T['$el'] extends HTMLElement ? T['$el'] : HTMLElement;

type Refs<T extends BaseProps> =
  T['$refs'] extends Record<string, unknown>
    ? T['$refs']
    : Record<string, HTMLElement | HTMLElement[]>;

type Options<T extends BaseProps> =
  T['$options'] extends Record<string, unknown> ? T['$options'] : Record<string, unknown>;

/**
 * A component that declares `$emits` may only emit those names; one that
 * does not keeps the unrestricted signature.
 */
type EmitName<T extends BaseProps> = T['$emits'] extends EmitMap
  ? keyof T['$emits'] & string
  : string;

/**
 * The `detail` an event carries: the declared payload object, or `null` for an
 * event declared `void`. `null` rather than `{}` because that is what the
 * platform stores for a `CustomEvent` built without a detail — nothing is
 * synthesized to stand in for a payload nobody announced.
 */
type EmitDetail<T extends BaseProps, K extends string> =
  // An un-narrowed `string` means the caller did not name the event, so
  // there is nothing to look up.
  string extends K
    ? unknown
    : T['$emits'] extends EmitMap
      ? K extends keyof T['$emits']
        ? T['$emits'][K] extends void
          ? null
          : T['$emits'][K]
        : never
      : unknown;

/**
 * `$emit()`'s payload parameter, as a tuple so a declared payload is
 * **required** and a `void` event takes no second argument at all.
 */
type EmitArgs<T extends BaseProps, K extends string> = string extends K
  ? [payload?: object]
  : T['$emits'] extends EmitMap
    ? K extends keyof T['$emits']
      ? T['$emits'][K] extends void
        ? []
        : [payload: T['$emits'][K]]
      : never
    : [payload?: object];

/**
 * The props a component was declared with, read from the phantom carrier
 * `Base` holds — inferring through `Base<infer P>` does not work, since the
 * parameter only appears inside conditional types.
 */
type PropsOf<T> = T extends { __props?: infer P }
  ? NonNullable<P> extends BaseProps
    ? NonNullable<P>
    : BaseProps
  : BaseProps;

export interface WatchChildrenCallbacks<T extends Base = Base> {
  added?(instance: T): void;
  removed?(instance: T): void;
}

/**
 * Live, DOM-ordered view over the mounted descendants of a name.
 */
export interface ChildrenCollection<T extends Base = Base> extends Iterable<T> {
  readonly size: number;
  readonly items: T[];
}

export interface LifecycleEventDetail {
  instance: Base;
}

/**
 * Per-instance list of handlers declared with the `@on` decorator, filled by
 * the decorator's initializers during construction and consumed by
 * `#bindHandlers()` on every mount.
 */
export const HANDLER_REGISTRATIONS: unique symbol = Symbol('handler registrations');

export interface HandlerRegistration {
  /** Child component name for delegated handlers, `null` for own events. */
  child: string | null;
  type: string;
  handler: (this: any, payload: any) => void;
}

declare global {
  interface Element {
    __base__?: Map<string, Base>;
  }
}

/**
 * A payload is one object, or nothing at all.
 *
 * TypeScript says so at every typed call site, but the no-build path — magic
 * `on<…>` method names, plain `<script type="module">` — never sees a type.
 * The rule is a convention rather than a mechanism, and a convention that is
 * only checked in a build step is invisible to the audience most likely to
 * break it: `$emit('slide', 1)` would work, and would box a positional
 * argument back into an API that just removed them. So it is said out loud,
 * once, at the moment the mistake is made. The event still dispatches — this
 * reports a shape, it does not police one.
 */
function checkPayload(event: string, payload: unknown): void {
  if (payload !== undefined && (typeof payload !== 'object' || payload === null)) {
    console.warn(
      `[base] \`$emit('${event}', …)\` takes one payload object; received ${typeof payload}. Name the value: \`{ value }\`.`,
    );
  }
}

/**
 * Resolve the `data-ref` elements that belong to a component: no other
 * `data-component` element sits between the ref and the component root.
 */
function belongsTo(el: Element, root: Element): boolean {
  let parent = el.parentElement;
  while (parent && parent !== root) {
    if (parent.hasAttribute('data-component')) {
      return false;
    }
    parent = parent.parentElement;
  }
  return parent === root;
}

/**
 * The elements currently declaring `data-ref="<name>"` inside a component,
 * skipping those owned by a nested component.
 */
function queryRefs(root: HTMLElement, name: string): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(`[data-ref="${name}"]`)].filter((el) =>
    belongsTo(el, root),
  );
}

/**
 * Build the live `$refs` view.
 *
 * Refs resolve on access rather than once at mount, so swapping a
 * component's markup — a `Fetch`-style DOM replacement, a template render —
 * never leaves `$refs` pointing at detached elements. There is nothing to
 * refresh and no `$update()` to call: the DOM is the source of truth, the
 * same way the registry treats it for components.
 *
 * A name declared as `name[]` always yields an array; a plain name yields
 * the first match.
 */
function buildRefs(instance: Base): Record<string, HTMLElement | HTMLElement[]> {
  const refs: Record<string, HTMLElement | HTMLElement[]> = {};
  for (const definition of instance.$config.refs ?? []) {
    const isList = definition.endsWith('[]');
    const name = isList ? definition.slice(0, -2) : definition;
    // Re-querying on every access is what keeps refs live, and it is the
    // one place v4 was measurably slower than v3's mount-time snapshot.
    // The lookup is cached against the document version instead: still
    // live, since any structural change invalidates it, but a repeated
    // read is a property read again.
    let cachedVersion = -1;
    let cached: HTMLElement[] = [];
    Object.defineProperty(refs, name, {
      enumerable: true,
      get() {
        // A detached subtree produces no mutation records, so nothing
        // would ever invalidate a cache built from it.
        if (!instance.$el.isConnected) {
          const elements = queryRefs(instance.$el, name);
          return isList ? elements : elements[0];
        }
        const version = domVersion();
        if (version !== cachedVersion) {
          cachedVersion = version;
          cached = queryRefs(instance.$el, name);
        }
        return isList ? cached : cached[0];
      },
    });
  }
  return refs;
}

/**
 * Build the live `$options` view.
 *
 * Values are read from the `data-option-*` attributes on every access, so an
 * attribute is always the source of truth. **Defaults belong to the
 * instance**, not to the class: each one is built once per instance and kept,
 * which is what makes `this.$options.list.push(x)` persist and what stops two
 * components from sharing — and corrupting — the same defaulted object.
 */
interface OptionReader {
  attribute: string;
  read(raw: string | null): unknown;
}

const optionReaders = new WeakMap<Base, Map<string, OptionReader>>();

function buildOptions(instance: Base): Record<string, unknown> {
  const options: Record<string, unknown> = {};
  const readers = new Map<string, OptionReader>();
  optionReaders.set(instance, readers);
  const el = instance.$el;
  for (const [name, definition] of Object.entries(instance.$config.options ?? {})) {
    const type = typeof definition === 'function' ? definition : definition.type;
    const declared = typeof definition === 'function' ? undefined : definition.default;
    const attribute = `data-option-${kebabCase(name)}`;

    // Built on first read and memoised, so repeated reads hand back the same
    // object and a mutation of it sticks — for this instance only.
    let memoized: unknown;
    let isMemoized = false;
    const defaultValue = (): unknown => {
      if (!isMemoized) {
        isMemoized = true;
        memoized = buildDefault();
      }
      return memoized;
    };
    const buildDefault = (): unknown => {
      // `Function` is not an option type, so a callable default is a factory.
      if (typeof declared === 'function') {
        return (declared as () => unknown)();
      }
      if (declared !== null && typeof declared === 'object') {
        // The types ask for a factory here; the no-build path has no types,
        // so a literal object or array is copied rather than shared.
        return Array.isArray(declared)
          ? [...declared]
          : { ...(declared as Record<string, unknown>) };
      }
      if (declared !== undefined) {
        return declared;
      }
      // An undeclared object or array default is still the instance's own.
      if (type === Array) return [];
      if (type === Object) return {};
      return undefined;
    };

    const read = (raw: string | null): unknown => {
      if (type === Boolean) {
        return raw === null ? (defaultValue() ?? false) : raw !== 'false';
      }
      if (raw === null) {
        const value = defaultValue();
        if (value !== undefined) return value;
        if (type === Number) return 0;
        if (type === String) return '';
        return undefined;
      }
      if (type === Number) {
        return Number(raw);
      }
      if (type === Array || type === Object) {
        try {
          return JSON.parse(raw);
        } catch {
          return defaultValue();
        }
      }
      return raw;
    };

    readers.set(name, { attribute, read });
    Object.defineProperty(options, name, {
      enumerable: true,
      get: () => read(el.getAttribute(attribute)),
    });
  }
  return options;
}

const resolvedConfigs = new WeakMap<BaseConstructor, BaseConfig>();

/**
 * Merge a class's config with every config declared up its prototype chain,
 * so extending a component never silently drops what the parent declared.
 *
 * `refs`, `options` and `components` merge (v3 merged only `options`, which
 * is what issue #627 reports); scalar keys such as `name` are overridden by
 * the most derived class. The result is cached per constructor.
 */
function resolveConfig(ctor: BaseConstructor): BaseConfig {
  const cached = resolvedConfigs.get(ctor);
  if (cached) {
    return cached;
  }

  const chain: BaseConfig[] = [];
  let current: BaseConstructor | null = ctor;
  while (current?.config) {
    if (Object.hasOwn(current, 'config')) {
      chain.unshift(current.config);
    }
    current = Object.getPrototypeOf(current) as BaseConstructor | null;
  }

  const config = chain.reduce<BaseConfig>(
    (merged, own) => ({
      ...merged,
      ...own,
      refs: [...new Set([...(merged.refs ?? []), ...(own.refs ?? [])])],
      options: { ...merged.options, ...own.options },
      components: { ...merged.components, ...own.components },
    }),
    { name: ctor.name },
  );

  resolvedConfigs.set(ctor, config);
  return config;
}

function getHandlerNames(instance: Base): Set<string> {
  const names = new Set<string>();
  let proto = Object.getPrototypeOf(instance);
  while (proto && proto !== Base.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (
        REGEX_HANDLER.test(name) &&
        typeof (instance as unknown as Record<string, unknown>)[name] === 'function'
      ) {
        names.add(name);
      }
    }
    proto = Object.getPrototypeOf(proto);
  }
  return names;
}

/**
 * `mounted()` may return one cleanup, several, nothing — or a promise of
 * those. The shape nests, so a subclass composes with what it extends
 * without unpacking it: `return [super.mounted(), () => { … }]`.
 */
export type MountedReturn = void | (() => void) | MountedReturn[] | Promise<MountedReturn>;

export class Base<T extends BaseProps = BaseProps> {
  static config: BaseConfig = { name: 'Base' };

  /**
   * Phantom carrier for the props type: type-only, never assigned, so
   * another component can read this one's declared surface.
   */
  declare readonly __props?: T;

  $el: El<T>;

  /**
   * Live view over the component's `data-ref` elements: every access
   * re-reads the DOM, so replaced markup is picked up with nothing to
   * refresh.
   */
  $refs: Refs<T> = {} as Refs<T>;

  $options: Options<T> = {} as Options<T>;

  #isMounted = false;

  #isTerminated = false;

  /** Per-mount-cycle listeners, removed on every `$destroy()`. */
  #listeners: Array<[string, EventListener, EventTarget, boolean]> = [];

  /** Per-mount-cycle cleanups (service unsubscriptions, `mounted()` return values). */
  #destroyCallbacks: Array<() => void> = [];

  /** Cleanup returned by each active `option<Name>Changed()` effect. */
  #optionCleanups = new Map<string, () => void>();

  /** Increments on mount so a reentrant effect cannot attach to a later cycle. */
  #mountCycle = 0;

  /** Instance-lifetime cleanups ($provide, $watchChildren…), run on `$terminate()`. */
  #terminateCallbacks: Array<() => void> = [];

  #tasks = new Set<ScheduledTask<unknown>>();

  /** Filled by the `@on` decorator's initializers, if any are used. */
  declare [HANDLER_REGISTRATIONS]?: HandlerRegistration[];

  get $config(): BaseConfig {
    return resolveConfig(this.constructor as BaseConstructor);
  }

  get $isMounted(): boolean {
    return this.#isMounted;
  }

  /** Whether `$terminate()` has run — the instance never mounts again. */
  get $isTerminated(): boolean {
    return this.#isTerminated;
  }

  constructor(el: HTMLElement) {
    this.$el = el as El<T>;
    el.__base__ ??= new Map();
    el.__base__.set(this.$config.name, this);
    // Both views resolve on access, so they are built once and stay correct
    // for the instance's whole life.
    this.$options = buildOptions(this) as Options<T>;
    this.$refs = buildRefs(this) as Refs<T>;
  }

  /**
   * Lifecycle hook, meant to be overridden. May return a cleanup function
   * (or an array of them) that runs on the next `$destroy()` — sync or
   * async:
   *
   *     async mounted() {
   *       const signal = await this.$inject(SomeContext);
   *       return signal.subscribe((value) => { … });
   *     }
   *
   * A component extending a mixin returns what it extends along with its
   * own, in any nesting:
   *
   *     mounted() {
   *       return [super.mounted(), () => { … }];
   *     }
   */
  mounted(): MountedReturn {}

  destroyed(): void {}

  terminated(): void {}

  /**
   * Mount the instance. Mounting is reversible: `$destroy()` is its inverse
   * and the same instance can mount again — this is what happens when an
   * element is moved or re-inserted in the DOM. A terminated instance never
   * mounts again.
   */
  $mount(): this {
    if (this.#isMounted || this.#isTerminated) {
      return this;
    }
    this.#bindHandlers();
    this.#isMounted = true;
    this.#mountCycle += 1;
    this.#initializeOptionEffects();
    try {
      this.#collectCleanup(this.mounted());
    } catch (error) {
      console.error('[base] `mounted()` failed:', error);
    }
    // Announce existence to every ancestor (objective 5, layer 1).
    const detail: LifecycleEventDetail = { instance: this };
    this.$el.dispatchEvent(new CustomEvent(MOUNTED_EVENT, { bubbles: true, detail }));
    return this;
  }

  /**
   * Unmount the instance — the reversible inverse of `$mount()`. Removes the
   * per-cycle listeners, leaves the services, runs the `mounted()` cleanups,
   * cancels pending scheduler tasks and calls the `destroyed()` hook. The
   * instance stays on its element and can mount again.
   */
  $destroy(): this {
    if (!this.#isMounted) {
      return this;
    }
    this.#isMounted = false;
    for (const [type, listener, target, capture] of this.#listeners) {
      target.removeEventListener(type, listener, capture);
    }
    this.#listeners = [];
    const callbacks = this.#destroyCallbacks;
    this.#destroyCallbacks = [];
    for (const callback of callbacks) {
      try {
        callback();
      } catch (error) {
        console.error('[base] Mount cleanup failed:', error);
      }
    }
    this.#clearOptionEffects();
    for (const task of this.#tasks) {
      task.cancel();
    }
    this.#tasks.clear();
    try {
      this.destroyed();
    } catch (error) {
      console.error('[base] `destroyed()` failed:', error);
    }
    // The element may already be detached, so a bubbling event would reach
    // nobody: announce from the document instead.
    const detail: LifecycleEventDetail = { instance: this };
    document.dispatchEvent(new CustomEvent(DESTROYED_EVENT, { detail }));
    return this;
  }

  /**
   * End of life — irreversible. Destroys first if needed, runs the
   * instance-lifetime cleanups ($provide, $watchChildren…), calls the
   * `terminated()` hook and detaches the instance from its element.
   */
  $terminate(): this {
    if (this.#isTerminated) {
      return this;
    }
    this.$destroy();
    this.#isTerminated = true;
    const callbacks = this.#terminateCallbacks;
    this.#terminateCallbacks = [];
    for (const callback of callbacks) {
      try {
        callback();
      } catch (error) {
        console.error('[base] Termination cleanup failed:', error);
      }
    }
    try {
      this.terminated();
    } catch (error) {
      console.error('[base] `terminated()` failed:', error);
    }
    this.$el.__base__?.delete(this.$config.name);
    return this;
  }

  /**
   * Dispatch a native bubbling, cancelable event, annotated with the
   * emitting instance.
   *
   * The payload is **one object**, and it is the event's `detail` verbatim —
   * what `CustomEvent` was built to carry, and what a plain listener on the
   * page reads. Omitting it leaves `detail` at the platform's own `null`, not
   * at a synthesized `{}`, so `$emit('open')` stays a single word:
   *
   *     this.$emit('open');
   *     this.$emit('slide', { direction: 1 });
   *
   * Fields are named because they outlive the call that introduced them: a
   * third thing worth announcing is a new key that every existing listener
   * ignores, where a third positional argument is a signature change.
   *
   * A component that declares `$emits` in its props gets its event names and
   * payloads checked here — the declaration is types only, so nothing about it
   * reaches the bundle.
   *
   * @returns Check `defaultPrevented` on the returned event.
   */
  $emit<K extends EmitName<T>>(event: K, ...payload: EmitArgs<T, K>): CustomEvent<EmitDetail<T, K>>;
  $emit(event: string, payload?: object): CustomEvent<unknown> {
    checkPayload(event, payload);
    return this.#dispatch(event, payload);
  }

  /**
   * Build and dispatch a component event: bubbling, cancelable, carrying one
   * `detail` and annotated with the instance that sent it.
   *
   * The single place any of that is decided. `$emit()` is this plus the
   * `$emits` type constraint; the negotiated protocol events are this without
   * it — see `#negotiated()` for why they must not have it.
   */
  #dispatch(event: string, detail: unknown): CustomEvent<unknown> {
    const e = new CustomEvent(event, { bubbles: true, cancelable: true, detail });
    (e as CustomEvent & { [SOURCE]?: Base })[SOURCE] = this;
    this.$el.dispatchEvent(e);
    return e;
  }

  $on(type: string, listener: EventListener, options?: AddEventListenerOptions): () => void {
    this.$el.addEventListener(type, listener, options);
    return () => this.$el.removeEventListener(type, listener, options);
  }

  $off(type: string, listener: EventListener, options?: AddEventListenerOptions): void {
    this.$el.removeEventListener(type, listener, options);
  }

  /**
   * Mounted descendant instances by component name, in DOM order.
   */
  $query<T extends Base = Base>(name: string): T[] {
    return [...this.$el.querySelectorAll(selectorFor(name))]
      .map((el) => el.__base__?.get(name))
      .filter((instance): instance is T => Boolean(instance?.$isMounted));
  }

  /**
   * Nearest mounted ancestor instance by component name.
   */
  $closest<T extends Base = Base>(name: string): T | null {
    let el = this.$el.parentElement;
    while (el) {
      const instance = el.__base__?.get(name);
      if (instance?.$isMounted) {
        return instance as T;
      }
      el = el.parentElement;
    }
    return null;
  }

  /**
   * Live, order-independent collection of mounted descendants (objective 5,
   * layer 2): initial `$query()` sweep + subscription to the bubbling
   * lifecycle announcements.
   */
  $watchChildren<T extends Base = Base>(
    name: string,
    callbacks: WatchChildrenCallbacks<T> = {},
  ): ChildrenCollection<T> {
    const instances = new Set<T>();
    const add = (instance: T) => {
      if ((instance as Base) !== this && !instances.has(instance)) {
        instances.add(instance);
        callbacks.added?.(instance);
      }
    };
    const remove = (instance: T) => {
      if (instances.delete(instance)) {
        callbacks.removed?.(instance);
      }
    };

    // Defer the initial sweep to a microtask: `$watchChildren` is typically
    // called in a field initializer, and already-mounted children would fire
    // `added` synchronously while `this` is still half-constructed. The
    // listeners below attach right away, so children mounting in between are
    // caught either way — the Set deduplicates.
    queueMicrotask(() => {
      if (this.#isTerminated) {
        return;
      }
      for (const instance of this.$query<T>(name)) {
        add(instance);
      }
    });

    const onMounted = (event: Event) => {
      const { instance } = (event as CustomEvent<LifecycleEventDetail>).detail;
      if (instance.$config.name === name && instance !== this) {
        add(instance as T);
      }
    };
    // Destroyed announcements are dispatched on the document (the element is
    // already detached); membership in the collection is the filter.
    const onDestroyed = (event: Event) => {
      remove((event as CustomEvent<LifecycleEventDetail>).detail.instance as T);
    };

    this.$el.addEventListener(MOUNTED_EVENT, onMounted);
    document.addEventListener(DESTROYED_EVENT, onDestroyed);
    // Instance-lifetime: the collection survives destroy/mount cycles.
    this.#terminateCallbacks.push(() => {
      this.$el.removeEventListener(MOUNTED_EVENT, onMounted);
      document.removeEventListener(DESTROYED_EVENT, onDestroyed);
    });

    return {
      get size() {
        return instances.size;
      },
      get items() {
        return [...instances].sort((a, b) =>
          a.$el.compareDocumentPosition(b.$el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
        );
      },
      [Symbol.iterator]() {
        return this.items[Symbol.iterator]();
      },
    };
  }

  /**
   * Provide a value to the subtree — nearest provider wins, and the value is
   * provided **verbatim**: what is handed over is what a consumer resolves.
   *
   * Reactive state is a `Signal`; a curated owner surface is an object of
   * commands (the `expose` pattern), which is how a control reaches its
   * coordinator without `$closest()` and the coupling that comes with it:
   *
   *     api = this.$provide(SliderContext, {
   *       state: signal({ index: 0, total: 0 }),
   *       goNext: () => this.goNext(),
   *     });
   *
   * The provider is instance-lifetime: it survives destroy/mount cycles and
   * is disposed on `$terminate()`.
   */
  $provide<V>(key: ContextKey<V>, value: V): V {
    const { dispose } = provideContext(this.$el, key, value);
    this.#terminateCallbacks.push(dispose);
    return value;
  }

  /**
   * Resolve the nearest provided value, now or when a provider appears.
   *
   * **The promise never settles while no provider exists** — deliberately:
   * order independence is the whole point, and a consumer mounting before its
   * provider must not be told "absent" by an ordering accident. Use
   * `$injectSync()` when an answer is needed now.
   *
   * The pending request is destroy-scoped, so a destroyed instance leaves
   * nothing behind — and `mounted()` runs again on remount, which re-issues
   * the request naturally.
   *
   * `{ subscribe: true, onProvide }` keeps the request live so a **nearer
   * provider mounting later** re-answers it, which is what a channel resolved
   * by name needs and a control that found its coordinator does not. The
   * subscription is destroy-scoped like the pending request, so it ends with
   * the mount cycle that opened it:
   *
   *     mounted() {
   *       this.$inject(RegistryKey, {
   *         subscribe: true,
   *         onProvide: (registry) => registry.join(this.group, this),
   *       });
   *     }
   */
  $inject<V>(key: ContextKey<V>, options?: InjectContextOptions<V>): Promise<V> {
    const { promise, cancel } = injectContext(this.$el, key, options);
    this.#destroyCallbacks.push(cancel);
    return promise;
  }

  /**
   * Resolve the nearest provided value — now, or not at all.
   *
   * Nothing is queued and nothing is replayed: `undefined` means no provider
   * is listening above this element at this moment, which a control can act
   * on instead of waiting:
   *
   *     onClick() {
   *       this.$injectSync(SliderContext)?.goToItem(this);
   *     }
   */
  $injectSync<V>(key: ContextKey<V>): V | undefined {
    return injectContextSync(this.$el, key);
  }

  /**
   * Apply one live declared-option change. Called by the registry after it
   * has reconciled component declarations for the mutation batch.
   *
   * The method convention is `option<Name>Changed()`. Its returned cleanup
   * runs before the next value is applied and on destroy.
   *
   * @internal
   */
  $optionChanged(name: string, previousRawValue: string | null): void {
    if (!this.#isMounted) {
      return;
    }
    const reader = optionReaders.get(this)?.get(name);
    if (!reader) {
      return;
    }
    this.#runOptionEffect(name, reader, previousRawValue, false);
  }

  /** Schedule a DOM read; canceled automatically when the instance unmounts. */
  $read<T>(fn: () => T): ScheduledTask<T> {
    return this.#track(defaultScheduler.read(fn));
  }

  /** Schedule a DOM write; canceled automatically when the instance unmounts. */
  $write<T>(fn: () => T): ScheduledTask<T> {
    return this.#track(defaultScheduler.write(fn));
  }

  /** Run a DOM update inside a batched native view transition. */
  $viewTransition(update: ViewTransitionUpdate): Promise<void> {
    return viewTransition(update);
  }

  /**
   * Dispatch a negotiated event: bubbling, cancelable and annotated with its
   * source — the same event `$emit()` builds, through the same `#dispatch()`,
   * with the payload object as `detail`. `dom-update` and the steps of a
   * choreography are shaped exactly like a component's own events.
   *
   * What it deliberately does **not** go through is the public `$emit()`, and
   * the payload shape is not the reason — that difference is gone. The reason
   * is the type constraint `$emit()` adds: a component declaring `$emits` may
   * only emit the names it listed, and a component must not have to declare a
   * framework protocol in order to announce through it. Routing here would
   * need a cast at every call — still a bypass, but a hidden one a reader has
   * to spot, rather than a named one. The three other protocol events —
   * `component:mounted`, `component:destroyed`, `context-request` — sit
   * outside `$emit()` for the same reason.
   *
   * Delegation is unaffected: `on<Child><Event>()` handlers are bound by event
   * type on the root element and walk up from `event.target`, so they never
   * see how the event was built, and a handler reads `{ payload: { wrap } }`
   * for exactly what a raw listener reads as `event.detail`.
   *
   * A component overriding `$emit` does not intercept these, which follows
   * from the above and is welcome — a framework protocol is not a component's
   * own event.
   */
  #negotiated(event: string): (detail: Record<string, unknown>) => void {
    return (detail) => {
      this.#dispatch(event, detail);
    };
  }

  /**
   * Announce an imminent DOM change, let an ancestor take it over, and apply it.
   *
   * A component that is about to mutate the DOM — insert a fetched fragment,
   * toggle a `<template>`, remove a node — runs the mutation through this
   * instead of doing it directly. The bubbling `dom-update` event announces it
   * first, and any ancestor may claim it synchronously with
   * `detail.wrap(runner)`, at which point the change runs through that runner:
   *
   *     // In the mutating component.
   *     await this.$domUpdate(() => this.$el.replaceChildren(fragment));
   *
   *     // In any ancestor, however far up.
   *     this.$on(DOM_UPDATE_EVENT, ({ detail }) => detail.wrap(viewTransition));
   *
   *     // Or, as a delegated child handler — the same payload.
   *     onFetchDomUpdate({ payload: { wrap } }) { wrap(viewTransition); }
   *
   * The event bubbles, is cancelable and carries its source, and
   * `defaultPrevented` is deliberately ignored: the change is announced, not
   * proposed, and a listener that wants nothing to happen has to say so through
   * its own state.
   *
   * Nobody claiming is synchronous — the mutation has run by the time this
   * returns — and the promise resolves once the change has been applied,
   * whether through a runner or directly. The mutation is never lost: a runner
   * that throws, rejects or forgets to call `apply` still gets the change
   * applied, exactly once, with the failure reported.
   *
   * @param mutate The DOM change to announce and apply.
   * @param detail Extra context for the listeners, merged into `event.detail`.
   */
  $domUpdate(mutate: DomMutation, detail?: Record<string, unknown>): Promise<void> {
    return domUpdate(this.#negotiated(DOM_UPDATE_EVENT), mutate, detail);
  }

  /**
   * Announce a step of a choreography, and wait for everything up the tree
   * that asked to hold it open.
   *
   * The delay half of the same mechanism `$domUpdate()` uses: a listener does
   * not replace the step, it postpones what comes after it. A dialog stays
   * painted while its contents animate out, without knowing that anything
   * animates:
   *
   *     // In the component running the choreography.
   *     async close() {
   *       await this.$emitExtendable('close');
   *       this.$el.close();
   *     }
   *
   *     // In anything above it, or in plain JavaScript on the page.
   *     this.$on('close', ({ detail }) => detail.waitUntil(this.leave()));
   *
   * `waitUntil()` takes something to await, something to call, or a duck-typed
   * object exposing a method named after the step. It accepts **every**
   * registration and awaits all of them, and no rejection propagates: a failing
   * extension is reported, and the choreography always completes.
   *
   * @param event  The step's event name.
   * @param detail Extra context for the listeners, merged into `event.detail`.
   */
  $emitExtendable(event: string, detail?: Record<string, unknown>): Promise<void> {
    return emitExtendable(this.#negotiated(event), event, detail);
  }

  #track<T>(task: ScheduledTask<T>): ScheduledTask<T> {
    this.#tasks.add(task);
    const finished = () => this.#tasks.delete(task);
    void task.promise.then(finished, finished);
    return task;
  }

  #initializeOptionEffects(): void {
    for (const [name, reader] of optionReaders.get(this) ?? []) {
      this.#runOptionEffect(name, reader, null, true);
    }
  }

  #runOptionEffect(
    name: string,
    reader: OptionReader,
    previousRawValue: string | null,
    initial: boolean,
  ): void {
    const previousCleanup = this.#optionCleanups.get(name);
    this.#optionCleanups.delete(name);
    if (previousCleanup) {
      try {
        previousCleanup();
      } catch (error) {
        console.error(`[base] Option "${name}" cleanup failed:`, error);
      }
    }
    if (!this.#isMounted) {
      return;
    }

    const method = `option${pascalCase(name)}Changed`;
    const handler = (this as unknown as Record<string, unknown>)[method];
    if (typeof handler !== 'function') {
      return;
    }

    const cycle = this.#mountCycle;
    let cleanup: OptionChangedReturn;
    try {
      const rawValue = this.$el.getAttribute(reader.attribute);
      const change: OptionChange = {
        name,
        value: reader.read(rawValue),
        previousValue: initial ? undefined : reader.read(previousRawValue),
        rawValue,
        previousRawValue,
        initial,
      };
      cleanup = (handler as (change: OptionChange) => OptionChangedReturn).call(this, change);
    } catch (error) {
      console.error(`[base] \`${method}()\` failed:`, error);
      return;
    }
    if (typeof cleanup === 'function') {
      if (this.#isMounted && this.#mountCycle === cycle) {
        this.#optionCleanups.set(name, cleanup);
      } else {
        try {
          cleanup();
        } catch (error) {
          console.error(`[base] Option "${name}" cleanup failed:`, error);
        }
      }
    }
  }

  #clearOptionEffects(): void {
    const cleanups = this.#optionCleanups;
    this.#optionCleanups = new Map();
    for (const [name, cleanup] of cleanups) {
      try {
        cleanup();
      } catch (error) {
        console.error(`[base] Option "${name}" cleanup failed:`, error);
      }
    }
  }

  /**
   * Register the cleanup value returned by `mounted()`. Async hooks are
   * awaited; if the instance was destroyed in the meantime, the cleanup runs
   * right away instead of leaking.
   */
  #collectCleanup(result: MountedReturn): void {
    if (typeof result === 'function') {
      if (this.#isMounted) {
        this.#destroyCallbacks.push(result);
      } else {
        // The instance was destroyed while an async `mounted()` was pending:
        // run the cleanup right away instead of leaking.
        try {
          result();
        } catch (error) {
          console.error('[base] Late mount cleanup failed:', error);
        }
      }
      return;
    }
    if (Array.isArray(result)) {
      for (const item of result) {
        this.#collectCleanup(item);
      }
      return;
    }
    if (result instanceof Promise) {
      result
        .then((resolved) => this.#collectCleanup(resolved))
        .catch((error) => console.error('[base] `mounted()` failed:', error));
    }
  }

  /**
   * Bind every handler the component declares (objective 4).
   *
   * `on<Event>` binds to the root element; `on<Child><Event>` and
   * `on<Ref><Event>` are delegated — one listener per event type on the
   * root, resolving the emitter by walking up from `event.target`. Nothing
   * is bound per child or per ref, so elements inserted, removed or swapped
   * later are handled with no rebinding.
   */
  #bindHandlers(): void {
    const self = this as unknown as Record<string, (payload: unknown) => void>;
    // Longest name first, so `onSliderDragStart` resolves to the declared
    // `SliderDrag` child, not to `Slider`.
    const byLength = (a: string, b: string) => b.length - a.length;
    const childNames = Object.keys(this.$config.components ?? {}).sort(byLength);
    const refNames = (this.$config.refs ?? [])
      .map((definition) => (definition.endsWith('[]') ? definition.slice(0, -2) : definition))
      .sort(byLength);

    type Entry =
      | { kind: 'child'; name: string; invoke: (payload: DelegatedEvent) => void }
      | { kind: 'ref'; name: string; invoke: (payload: RefEvent) => void };
    const delegated = new Map<string, Entry[]>();
    const addDelegated = (type: string, entry: Entry) => {
      if (!delegated.has(type)) {
        delegated.set(type, []);
      }
      delegated.get(type)?.push(entry);
    };
    const bindOwn = (type: string, invoke: (event: Event) => void) => {
      const listener: EventListener = (event) => invoke(event);
      this.$el.addEventListener(type, listener);
      this.#listeners.push([type, listener, this.$el, false]);
    };

    // Handlers declared with the `@on` decorator: explicit target/type
    // pairs, so no name parsing and no config lookup to resolve them.
    const registrations = this[HANDLER_REGISTRATIONS] ?? [];
    const decorated = new Set(registrations.map(({ handler }) => handler));
    for (const { child, type, handler } of registrations) {
      if (child) {
        const kind = refNames.includes(child) && !childNames.includes(child) ? 'ref' : 'child';
        addDelegated(type, {
          kind,
          name: child,
          invoke: (payload: DelegatedEvent | RefEvent) => handler.call(this, payload),
        } as Entry);
      } else {
        bindOwn(type, (event) => handler.call(this, event));
      }
    }

    // Magic `on<Child><Event>` / `on<Ref><Event>` / `on<Event>` method
    // names — the no-build path. A method already bound through a decorator
    // is skipped. Children are matched before refs: a name declared as both
    // resolves to the component.
    for (const method of getHandlerNames(this)) {
      if (decorated.has(self[method])) {
        continue;
      }
      const rest = method.slice(2);
      const startsWith = (name: string) =>
        rest.startsWith(pascalCase(name)) && rest.length > name.length;
      const childName = childNames.find(startsWith);
      const refName = childName ? undefined : refNames.find(startsWith);

      if (childName) {
        addDelegated(kebabCase(rest.slice(childName.length)), {
          kind: 'child',
          name: childName,
          invoke: (payload) => self[method](payload),
        });
      } else if (refName) {
        addDelegated(kebabCase(rest.slice(refName.length)), {
          kind: 'ref',
          name: refName,
          invoke: (payload) => self[method](payload),
        });
      } else {
        bindOwn(kebabCase(rest), (event) => self[method](event));
      }
    }

    for (const [type, entries] of delegated) {
      const listener: EventListener = (event) => {
        let el = event.target instanceof Element ? event.target : null;
        while (el && el !== this.$el) {
          let invoked = false;
          for (const entry of entries) {
            if (entry.kind === 'child') {
              const child = el.__base__?.get(entry.name);
              if (child?.$isMounted) {
                entry.invoke({
                  event,
                  target: child,
                  // The detail verbatim — what a plain listener reads.
                  payload: (event as CustomEvent).detail,
                });
                invoked = true;
              }
            } else if (el.getAttribute('data-ref') === entry.name && belongsTo(el, this.$el)) {
              const target = el as HTMLElement;
              entry.invoke({
                event,
                target,
                index: queryRefs(this.$el, entry.name).indexOf(target),
              });
              invoked = true;
            }
          }
          // Nearest matching target wins; every handler for it fired.
          if (invoked) {
            return;
          }
          el = el.parentElement;
        }
      };
      // Non-bubbling events never reach the root during the bubble phase,
      // so they are delegated from the capture phase instead.
      const capture = CAPTURED_EVENTS.has(type);
      this.$el.addEventListener(type, listener, capture);
      this.#listeners.push([type, listener, this.$el, capture]);
    }
  }
}
