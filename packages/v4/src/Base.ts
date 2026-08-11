import { Signal, injectContext, provideContext, type ContextKey } from './context.js';
import { scheduler, type ScheduledTask } from './scheduler.js';
import { kebabCase, pascalCase, selectorFor } from './utils.js';
import { viewTransition, type ViewTransitionUpdate } from './viewTransition.js';

export const SOURCE: unique symbol = Symbol('emitter');
export const MOUNTED_EVENT = 'component:mounted';
export const DESTROYED_EVENT = 'component:destroyed';

const REGEX_HANDLER = /^on[A-Z]/;

export type OptionType =
  | typeof String
  | typeof Number
  | typeof Boolean
  | typeof Array
  | typeof Object;

export type OptionDefinition = OptionType | { type: OptionType; default?: unknown };

export interface BaseConfig {
  name: string;
  components?: Record<string, BaseConstructor>;
  refs?: string[];
  options?: Record<string, OptionDefinition>;
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
 */
export interface DelegatedEvent<T extends Base = Base> {
  event: Event;
  target: T;
  args: unknown[];
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
 *       $refs: { wrapper: HTMLElement; slides: HTMLElement[] };
 *       $options: { autoplay: boolean };
 *       $emits: { slide: [index: number] };
 *     }> {}
 *
 * `$emits` documents what the component dispatches and types `$emit()`'s
 * arguments, replacing v3's runtime `config.emits` array.
 */
export interface BaseProps {
  $refs?: Record<string, HTMLElement | HTMLElement[]>;
  $options?: Record<string, unknown>;
  $emits?: Record<string, unknown[]>;
}

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
type EmitName<T extends BaseProps> =
  T['$emits'] extends Record<string, unknown[]> ? keyof T['$emits'] & string : string;

type EmitArgs<T extends BaseProps, K extends string> =
  T['$emits'] extends Record<string, unknown[]>
    ? K extends keyof T['$emits']
      ? T['$emits'][K]
      : never
    : unknown[];

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
    Object.defineProperty(refs, name, {
      enumerable: true,
      get() {
        const elements = queryRefs(instance.$el, name);
        return isList ? elements : elements[0];
      },
    });
  }
  return refs;
}

function buildOptions(instance: Base): Record<string, unknown> {
  const options: Record<string, unknown> = {};
  const el = instance.$el;
  for (const [name, definition] of Object.entries(instance.$config.options ?? {})) {
    const type = typeof definition === 'function' ? definition : definition.type;
    const defaultValue = typeof definition === 'function' ? undefined : definition.default;
    const attribute = `data-option-${kebabCase(name)}`;
    Object.defineProperty(options, name, {
      enumerable: true,
      get() {
        if (type === Boolean) {
          if (!el.hasAttribute(attribute)) {
            return defaultValue ?? false;
          }
          return el.getAttribute(attribute) !== 'false';
        }
        const raw = el.getAttribute(attribute);
        if (raw === null) {
          if (defaultValue !== undefined) return defaultValue;
          if (type === Number) return 0;
          if (type === String) return '';
          if (type === Array) return [];
          if (type === Object) return {};
          return undefined;
        }
        if (type === Number) {
          return Number(raw);
        }
        if (type === Array || type === Object) {
          try {
            return JSON.parse(raw);
          } catch {
            return defaultValue ?? (type === Array ? [] : {});
          }
        }
        return raw;
      },
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
 * those.
 */
export type MountedReturn =
  | void
  | (() => void)
  | Array<() => void>
  | Promise<void | (() => void) | Array<() => void>>;

export class Base<T extends BaseProps = BaseProps> {
  static config: BaseConfig = { name: 'Base' };

  $el: HTMLElement;

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

  /** Per-mount-cycle cleanups (`mounted()` return values), run on `$destroy()`. */
  #destroyCallbacks: Array<() => void> = [];

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

  constructor(el: HTMLElement) {
    this.$el = el;
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
    this.#collectCleanup(this.mounted());
    // Announce existence to every ancestor (objective 5, layer 1).
    const detail: LifecycleEventDetail = { instance: this };
    this.$el.dispatchEvent(new CustomEvent(MOUNTED_EVENT, { bubbles: true, detail }));
    return this;
  }

  /**
   * Unmount the instance — the reversible inverse of `$mount()`. Removes the
   * per-cycle listeners, runs the `mounted()` cleanups, cancels pending
   * scheduler tasks and calls the `destroyed()` hook. The instance stays on
   * its element and can mount again.
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
      callback();
    }
    for (const task of this.#tasks) {
      task.cancel();
    }
    this.#tasks.clear();
    this.destroyed();
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
      callback();
    }
    this.terminated();
    this.$el.__base__?.delete(this.$config.name);
    return this;
  }

  /**
   * Dispatch a native bubbling, cancelable event, annotated with the
   * emitting instance.
   *
   * A component that declares `$emits` in its props gets its event names
   * and payloads checked here — the declaration is types only, so nothing
   * about it reaches the bundle.
   *
   * @returns Check `defaultPrevented` on the returned event.
   */
  $emit<K extends EmitName<T>>(event: K, ...args: EmitArgs<T, K>): CustomEvent<unknown[]>;
  $emit(event: string, ...args: unknown[]): CustomEvent<unknown[]> {
    const e = new CustomEvent(event, { bubbles: true, cancelable: true, detail: args });
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
   * Provide a reactive signal to the subtree (nearest provider wins).
   */
  $provide<T>(key: ContextKey<T>, value: T | Signal<T>): Signal<T> {
    const { signal, dispose } = provideContext(this.$el, key, value);
    this.#terminateCallbacks.push(dispose);
    return signal;
  }

  /**
   * Resolve the nearest provided signal, now or when a provider appears.
   */
  $inject<T>(key: ContextKey<T>): Promise<Signal<T>> {
    const { promise, cancel } = injectContext(this.$el, key);
    this.#terminateCallbacks.push(cancel);
    return promise;
  }

  /** Schedule a DOM read; canceled automatically when the instance unmounts. */
  $read<T>(fn: () => T): ScheduledTask<T> {
    return this.#track(scheduler.read(fn));
  }

  /** Schedule a DOM write; canceled automatically when the instance unmounts. */
  $write<T>(fn: () => T): ScheduledTask<T> {
    return this.#track(scheduler.write(fn));
  }

  /** Run a DOM update inside a batched native view transition. */
  $viewTransition(update: ViewTransitionUpdate): Promise<void> {
    return viewTransition(update);
  }

  #track<T>(task: ScheduledTask<T>): ScheduledTask<T> {
    this.#tasks.add(task);
    task.promise.finally(() => this.#tasks.delete(task));
    return task;
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
        result();
      }
      return;
    }
    if (Array.isArray(result)) {
      for (const fn of result) {
        if (typeof fn === 'function') {
          this.#collectCleanup(fn);
        }
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
                  args: Array.isArray((event as CustomEvent).detail)
                    ? ((event as CustomEvent).detail as unknown[])
                    : [],
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
