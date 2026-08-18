import {
  isNetChange,
  NEGATED_RAW,
  negatedOptionAttributeFor,
  optionAttributeFor,
  REF_ATTRIBUTE,
} from './attributes.js';
import { BASE_BRAND } from './component-brand.js';
import { componentTokens } from './component-declarations.js';
import { registerChildrenWatcher, type ChildrenWatcher } from './children-watchers.js';
import { injectContext, injectContextSync, provideContext, type ContextKey } from './context.js';
import { reportDiagnostic, warnOnce } from './diagnostics.js';
import { compareDocumentOrder } from './document-order.js';
import { domVersion } from './dom-mutations.js';
import { EVENTS } from './events.js';
import { HANDLER_REGISTRATIONS, INSTANCES } from './protocol-symbols.js';
import { defaultScheduler, type ScheduledTask } from './scheduler.js';
import {
  activeBreakpoint,
  checkResponsiveAttributes,
  isResponsiveAttribute,
  responsiveRawValue,
  watchBreakpoint,
} from './responsive-options.js';
import type { MountStrategy } from './mount-strategies.js';
import { memo } from './utils/memo.js';
import { selectorFor } from './utils/selectors.js';
import { capitalize, kebabCase } from './utils/strings.js';

const REGEX_HANDLER = /^on[A-Z]/;

let componentId = 0;

export type OptionType =
  | typeof String
  | typeof Number
  | typeof Boolean
  | typeof Array
  | typeof Object;

/** An ordered list of types accepted by one option. */
export type OptionTypes = readonly OptionType[];

type OptionDefinitionType = OptionType | OptionTypes;

/**
 * The value an option of a given type holds.
 */
type OptionValue<T extends OptionDefinitionType> = T extends OptionTypes
  ? OptionValue<T[number]>
  : T extends typeof String
    ? string
    : T extends typeof Number
      ? number
      : T extends typeof Boolean
        ? boolean
        : T extends typeof Array
          ? unknown[]
          : Record<string, unknown>;

type PrimitiveOptionType = typeof String | typeof Number | typeof Boolean;

/** `Array` and `Object` defaults must be per-instance factories. */
type TypedOptionDefinition<T extends OptionDefinitionType = OptionDefinitionType> =
  T extends OptionTypes
    ? {
        type: T;
        default?:
          | (() => OptionValue<T>)
          | (Extract<T[number], PrimitiveOptionType> extends never
              ? never
              : OptionValue<Extract<T[number], PrimitiveOptionType>>);
      }
    : T extends OptionType
      ? T extends typeof Array | typeof Object
        ? { type: T; default?: () => OptionValue<T> }
        : { type: T; default?: OptionValue<T> | (() => OptionValue<T>) }
      : never;

export type OptionDefinition = OptionDefinitionType | TypedOptionDefinition;

export interface OptionChange<T = unknown> {
  name: string;
  value: T;
  previousValue: T | undefined;
  rawValue: string | null;
  previousRawValue: string | null;
  initial: boolean;
}

export type OptionChangedReturn = void | (() => void);

/** Lazy importer resolving to a component class, default export or module namespace. */
export type ComponentImporter = () => Promise<unknown>;

export interface BaseConfig {
  name: string;
  /** Child classes or lazy importers keyed by component name. Importers are registered without being called. */
  components?: Record<string, BaseConstructor | ComponentImporter>;
  refs?: string[];
  options?: Record<string, OptionDefinition>;
  /**
   * When instances of this component mount. Defaults to `eager`; an
   * element's `data-mount` attribute overrides it.
   */
  mountStrategy?: MountStrategy;
}

/** Structural component constructor compatible with typed `Base` subclasses. */
export interface BaseConstructor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (el: HTMLElement): Base<any>;
  config: BaseConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly prototype: Base<any>;
}

/** Child event payload. `payload` is the unchanged event detail, typed from the child's `$emits`. */
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

/** Global handler payload containing the named target and platform event. */
export interface GlobalEvent<T extends Event = Event> {
  event: T;
  target: Window | Document;
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
 * Type-level description of a component's public surface.
 *
 * `$el` narrows the root element. `$emits` maps event names to payload objects, or `void` for events without payloads. Declarations do not validate markup at runtime.
 */
export interface BaseProps {
  $el?: HTMLElement;
  $refs?: Record<string, HTMLElement | HTMLElement[]>;
  /** `object` accepts named option interfaces without requiring an index signature. */
  $options?: object;
  $emits?: EmitMap;
}

/**
 * What `$emits` maps an event name to: the payload object the event carries,
 * or `void` for one that carries nothing.
 */
export type EmitMap = Record<string, object | void>;

/* Intersections keep generic props resolved and `Base<T>` assignable to `Base`. */

type El<T extends BaseProps> = T['$el'] & HTMLElement;

type Refs<T extends BaseProps> = T['$refs'] & Record<string, HTMLElement | HTMLElement[]>;

type Options<T extends BaseProps> = T['$options'] & Record<string, unknown>;

/** Resolve declared event names without widening them to `string`. */
type Emits<T extends BaseProps> = NonNullable<T['$emits']> &
  (unknown extends T['$emits'] ? EmitMap : unknown);

/**
 * A component that declares `$emits` may only emit those names; one that
 * does not keeps the unrestricted signature — `keyof EmitMap` is `string`.
 */
type EmitName<T extends BaseProps> = keyof Emits<T> & string;

/**
 * The `detail` an event carries: the declared payload object, or `null` for an
 * event declared `void`. `null` rather than `{}` because that is what the
 * platform stores for a `CustomEvent` built without a detail — nothing is
 * synthesized to stand in for a payload nobody announced.
 */
type EmitDetail<T extends BaseProps, K extends string> =
  // An un-narrowed `string` means the caller did not name the event, so
  // there is nothing to look up.
  string extends K ? unknown : PayloadOf<Emits<T>, K>;

/**
 * One payload, looked up in a resolved `$emits` map. The lookup is an indexed
 * access rather than `K extends keyof M ? … : never`: `keyof M` mentions the
 * props parameter, and a conditional that tests against it is deferred for
 * every component that has one.
 */
type PayloadOf<M extends EmitMap, K extends string> = M[K] extends void ? null : M[K];

/**
 * `$emit()`'s payload parameter, as a tuple so a declared payload is
 * **required** and a `void` event takes none — an event declared `void` accepts
 * no payload object, only the absent argument.
 */
type EmitArgs<T extends BaseProps, K extends string> = string extends K
  ? [payload?: object]
  : ArgsOf<Emits<T>, K>;

/** Check concrete `void` first so generic component argument tuples remain resolvable. */
type ArgsOf<M extends EmitMap, K extends string> = void extends M[K]
  ? [payload?: M[K]]
  : [payload: M[K]];

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
 * Live, DOM-ordered view over mounted descendants matched by exact component
 * name or by a component constructor and its subclasses.
 */
export interface ChildrenCollection<T extends Base = Base> extends Iterable<T> {
  readonly size: number;
  readonly items: T[];
}

export interface LifecycleEventDetail {
  instance: Base;
}

/**
 * One handler declared with the `@on` decorator. Initializers store these on
 * the realm-stable `HANDLER_REGISTRATIONS` key for each instance.
 */
export interface HandlerRegistration {
  /**
   * The decorated method's name, and the only key the magic name scan dedupes
   * on. Not the function it decorates: `@read` and `@write` **replace** the
   * method with a wrapper, so a `@write` applied above an `@on` leaves the
   * class carrying a function this registration never saw. Comparing
   * identities missed it and bound the same handler a second time, which made
   * the order the two decorators are stacked in part of the interface. The
   * name is the same on both sides whatever wraps the body.
   */
  method: string | symbol;
  /**
   * Global event target for `@on(window, …)` / `@on(document, …)`, `null` for
   * everything the component can reach from its own subtree. Recorded as the
   * target itself rather than as a reserved `child` name, so the string space
   * stays free for a child or a ref actually called `window`.
   */
  target: Window | Document | null;
  /**
   * Child component name — or ref name, spelled the way `config.refs` declares
   * it, `[]` included for a list — for delegated handlers. `null` for own
   * events.
   */
  child: string | null;
  type: string;
  handler: (this: any, payload: any) => void;
}

declare global {
  interface Element {
    [INSTANCES]?: Map<string, Base>;
  }
}

/** Warn for non-object payloads used from untyped code. The event still dispatches. */
function checkPayload(instance: Base, event: string, payload: unknown): void {
  if (payload !== undefined && (typeof payload !== 'object' || payload === null)) {
    warnOnce(
      instance,
      event,
      'event.invalid-emit-payload',
      `\`$emit('${event}', …)\` takes one payload object; received ${typeof payload}. Name the value: \`{ value }\`.`,
      { component: instance.$config.name, target: instance.$el },
    );
  }
}

/**
 * Test ref ownership. Plain refs stop at any component boundary; namespaced refs stop at a boundary with the named component.
 *
 * The root is not tested because the namespace uses the class config name, which can differ from its declaration token.
 */
function belongsTo(el: Element, root: Element, owner?: string): boolean {
  let parent = el.parentElement;
  while (parent && parent !== root) {
    const declarations = componentTokens(parent);
    if (owner === undefined ? declarations.size > 0 : declarations.has(owner)) {
      return false;
    }
    parent = parent.parentElement;
  }
  return parent === root;
}

/** The list suffix is part of both the declaration and `data-ref` value. */
const REF_LIST_SUFFIX = '[]';

function isRefList(definition: string): boolean {
  return definition.endsWith(REF_LIST_SUFFIX);
}

/** The name a `config.refs` entry takes in `$refs`, and in `on<Ref><Event>`. */
function refPropertyName(definition: string): string {
  return isRefList(definition) ? definition.slice(0, -REF_LIST_SUFFIX.length) : definition;
}

/** Namespaced refs name their owner and can cross other component boundaries. */
const REF_NAMESPACE_SEPARATOR = '.';

/** Return `Component.ref[]`; the namespace wraps the complete ref definition. */
function namespacedRef(componentName: string, definition: string): string {
  return `${componentName}${REF_NAMESPACE_SEPARATOR}${definition}`;
}

/**
 * Does this element declare `definition` as a ref of `root`, in either
 * spelling? The two forms scope differently, so which one was written decides
 * how ownership is resolved.
 */
function isRefOf(
  el: Element,
  root: Element,
  componentName: string,
  definition: string,
): el is HTMLElement {
  const declared = el.getAttribute(REF_ATTRIBUTE);
  if (declared === definition) {
    return belongsTo(el, root);
  }
  return (
    declared === namespacedRef(componentName, definition) && belongsTo(el, root, componentName)
  );
}

/** Return owned plain and namespaced refs for the declared name, in document order. */
function queryRefs(root: HTMLElement, componentName: string, definition: string): HTMLElement[] {
  const plain = [
    ...root.querySelectorAll<HTMLElement>(`[${REF_ATTRIBUTE}="${definition}"]`),
  ].filter((el) => belongsTo(el, root));
  const namespaced = root.querySelectorAll<HTMLElement>(
    `[${REF_ATTRIBUTE}="${namespacedRef(componentName, definition)}"]`,
  );
  if (namespaced.length === 0) {
    return plain;
  }
  const owned = [...namespaced].filter((el) => belongsTo(el, root, componentName));
  if (plain.length === 0) {
    return owned;
  }
  // One property, so one document order — an index handed to `on<Ref><Event>`
  // has to mean the same thing as an index into `$refs`.
  return [...plain, ...owned].sort(compareDocumentOrder);
}

/** Warn once when a missing list ref has an unsuffixed markup candidate. */
function warnMissingRefSuffix(instance: Base, definition: string, checked: Set<string>): void {
  if (checked.has(definition)) {
    return;
  }
  checked.add(definition);
  const name = refPropertyName(definition);
  const namespaced = namespacedRef(instance.$config.name, name);
  // Both spellings, so `data-ref="Slider.dots"` is caught the same way
  // `data-ref="dots"` is. This runs once per instance and per ref, and only
  // when the ref found nothing, so the selector list costs nothing here.
  if (
    !instance.$el.querySelector(`[${REF_ATTRIBUTE}="${name}"],[${REF_ATTRIBUTE}="${namespaced}"]`)
  ) {
    return;
  }
  warnOnce(
    instance,
    `attribute:${definition}`,
    'ref.mismatch',
    `\`${instance.$config.name}\` declares \`${definition}\` and found no \`data-ref="${definition}"\`, but the markup declares \`data-ref="${name}"\`. A list ref carries the \`[]\` in the attribute too: add it, or drop it from \`config.refs\`.`,
    { component: instance.$config.name, target: instance.$el },
  );
}

/** Warn when `@on()` uses a list ref's derived property name instead of its suffixed declaration. */
function warnRefSuffixMismatch(
  instance: Base,
  child: string,
  refs: Array<{ definition: string }>,
): void {
  const other = isRefList(child) ? refPropertyName(child) : `${child}${REF_LIST_SUFFIX}`;
  if (!refs.some(({ definition }) => definition === other)) {
    return;
  }
  warnOnce(
    instance,
    `handler:${child}`,
    'ref.mismatch',
    `\`${instance.$config.name}\` binds \`@on('${child}', …)\`, which matches no component and no ref. The ref is declared \`${other}\`, and \`@on()\` names a ref the way it is declared: write \`@on('${other}', …)\`.`,
    { component: instance.$config.name, target: instance.$el },
  );
}

/**
 * Build live refs resolved from current DOM. List declarations return arrays; namespaced attributes use the unqualified property name.
 */
function buildRefs(instance: Base): Record<string, HTMLElement | HTMLElement[]> {
  const refs: Record<string, HTMLElement | HTMLElement[]> = {};
  const checked = new Set<string>();
  const componentName = instance.$config.name;
  for (const definition of instance.$config.refs ?? []) {
    const isList = isRefList(definition);
    const name = refPropertyName(definition);
    // Cache live refs by document version; structural changes invalidate them.
    let cachedVersion = -1;
    let cached: HTMLElement[] = [];
    Object.defineProperty(refs, name, {
      enumerable: true,
      get() {
        let elements: HTMLElement[];
        // A detached subtree produces no mutation records, so nothing
        // would ever invalidate a cache built from it.
        if (instance.$el.isConnected) {
          const version = domVersion();
          if (version !== cachedVersion) {
            cachedVersion = version;
            cached = queryRefs(instance.$el, componentName, definition);
          }
          elements = cached;
        } else {
          elements = queryRefs(instance.$el, componentName, definition);
        }
        if (isList && elements.length === 0) {
          warnMissingRefSuffix(instance, definition, checked);
        }
        return isList ? elements : elements[0];
      },
    });
  }
  return refs;
}

/** Build live attribute-backed options with per-instance defaults. */
interface OptionReader {
  /** The unsuffixed `data-option-*` attribute — the base of the cascade. */
  attribute: string;
  /**
   * The raw string in force now: the value of the breakpoint-scoped spelling
   * the cascade selects, or the base attribute's when none is scoped.
   */
  rawValue(): string | null;
  /**
   * The raw string that was in force at another breakpoint, or before a
   * mutation batch. `get` supplies the attribute values to resolve against, so
   * the same cascade answers both questions.
   */
  rawValueAt(breakpoint: string, get: (name: string) => string | null): string | null;
  /** Whether an attribute name is this option's, at any breakpoint. */
  owns(attributeName: string): boolean;
  read(raw: string | null): unknown;
}

const optionReaders = new WeakMap<Base, Map<string, OptionReader>>();

/** The method name an option's effect is declared under. */
function optionChangedMethod(name: string): string {
  return `option${capitalize(name)}Changed`;
}

/** The effect an option declares, or `undefined` when the component declares none. */
function optionChangedHandler(
  instance: Base,
  name: string,
): ((change: OptionChange) => OptionChangedReturn) | undefined {
  const handler = (instance as unknown as Record<string, unknown>)[optionChangedMethod(name)];
  return typeof handler === 'function'
    ? (handler as (change: OptionChange) => OptionChangedReturn)
    : undefined;
}

/** Warn once per declaration for literal object or array defaults. Values are not copied. */
function warnLiteralDefault(
  componentName: string,
  option: string,
  definition: object,
  declared: object,
  target: Element,
): void {
  const kind = Array.isArray(declared) ? 'array' : 'object';
  warnOnce(
    definition,
    '',
    'option.literal-default',
    `\`${componentName}\` declares option \`${option}\` with a literal ${kind} default, which every instance of it then shares. Only a primitive may be a default; declare this one as a factory: \`default: () => (…)\`.`,
    { component: componentName, target },
  );
}

/** Turn the attribute in force into a value. `null` means the attribute is absent. */
type OptionTypeRule = (raw: string | null, defaultValue: () => unknown) => unknown;

/** An absent attribute reads the declared default, or the type's empty value. */
function absentValue(defaultValue: () => unknown, empty: unknown): unknown {
  const value = defaultValue();
  return value === undefined ? empty : value;
}

/**
 * `buildDefault()` already answers `[]` or `{}` when nothing was declared, so
 * a structured type needs no empty value of its own. Unparsable JSON is not a
 * failure either: the option falls back to that same default.
 */
function readJSON(raw: string | null, defaultValue: () => unknown): unknown {
  if (raw === null) {
    return absentValue(defaultValue, undefined);
  }
  try {
    return JSON.parse(raw);
  } catch {
    return defaultValue();
  }
}

function emptyValue(type: OptionType): unknown {
  if (type === Boolean) return false;
  if (type === Number) return 0;
  if (type === String) return '';
  if (type === Array) return [];
  return {};
}

function isOptionValue(value: unknown, type: OptionType): boolean {
  if (type === Boolean) return typeof value === 'boolean';
  if (type === Number) return typeof value === 'number' && !Number.isNaN(value);
  if (type === String) return typeof value === 'string';
  if (type === Array) return Array.isArray(value);
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** What each supported option type makes of its attribute. */
const OPTION_TYPE_RULES = new Map<OptionType, OptionTypeRule>([
  // Presence is the value — the attribute is there or it is not, as a platform
  // boolean attribute is — so `data-option-x="false"` reads `true` and the way
  // to turn one off is to remove the attribute or to write its negated
  // spelling. Unlike every other type, a declared `null` default still reads
  // as `false`.
  [
    Boolean,
    (raw, defaultValue) => (raw === null ? (defaultValue() ?? false) : raw !== NEGATED_RAW),
  ],
  [Number, (raw, defaultValue) => (raw === null ? absentValue(defaultValue, 0) : Number(raw))],
  [String, (raw, defaultValue) => (raw === null ? absentValue(defaultValue, '') : raw)],
  [Array, readJSON],
  [Object, readJSON],
]);

function readUnion(types: OptionTypes, raw: string | null, defaultValue: () => unknown): unknown {
  if (raw === null) {
    return absentValue(defaultValue, types[0] === undefined ? undefined : emptyValue(types[0]));
  }

  // A negation is not a value, so it is answered before the members are tried:
  // `[String, Boolean]` would otherwise hand the sentinel to the string rule,
  // which accepts any string, and the option would read as one.
  if (raw === NEGATED_RAW) {
    return false;
  }

  for (const type of types) {
    const value = OPTION_TYPE_RULES.get(type)!(raw, () => undefined);
    if (isOptionValue(value, type)) {
      return value;
    }
  }

  return defaultValue();
}

function isOptionTypes(value: unknown): value is OptionTypes {
  return Array.isArray(value);
}

function isOptionShorthand(definition: OptionDefinition): definition is OptionType | OptionTypes {
  return typeof definition === 'function' || isOptionTypes(definition);
}

/**
 * Whether an option can hold `false`, and therefore whether the negated
 * attribute means anything for it. A union is enough: `[Boolean, String]` can
 * be turned off, `[String, Number]` has nothing to turn off.
 */
export function declaresBoolean(definition: OptionDefinition): boolean {
  const type = isOptionShorthand(definition) ? definition : definition.type;
  return isOptionTypes(type) ? type.includes(Boolean) : type === Boolean;
}

function buildOptions(instance: Base): Record<string, unknown> {
  const options: Record<string, unknown> = {};
  const readers = new Map<string, OptionReader>();
  optionReaders.set(instance, readers);
  const el = instance.$el;
  for (const [name, definition] of Object.entries(instance.$config.options ?? {})) {
    const shorthand = isOptionShorthand(definition);
    const type = shorthand ? definition : definition.type;
    const declared = shorthand ? undefined : definition.default;
    const attribute = optionAttributeFor(name);
    // Only an option which can hold `false` has an off spelling to read.
    const negated = declaresBoolean(definition) ? negatedOptionAttributeFor(name) : undefined;

    if (!shorthand && declared !== null && typeof declared === 'object') {
      warnLiteralDefault(instance.$config.name, name, definition, declared, el);
    }

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
      // Anything else is handed over as declared — including a literal object
      // or array, which the contract does not allow and `warnLiteralDefault()`
      // has already reported. Copying it here would repair a declaration the
      // contract rejects, and make an unsupported form look supported.
      if (declared !== undefined) {
        return declared;
      }
      // An undeclared object or array default is still the instance's own.
      const defaultType = isOptionTypes(type) ? type[0] : type;
      if (defaultType === Array) return [];
      if (defaultType === Object) return {};
      return undefined;
    };

    const read = (raw: string | null): unknown =>
      isOptionTypes(type)
        ? readUnion(type, raw, defaultValue)
        : (
            OPTION_TYPE_RULES.get(type) ??
            ((value, fallback) => (value === null ? absentValue(fallback, undefined) : value))
          )(raw, defaultValue);

    // Every option is responsive, and it is **derived on read**: the getter
    // consults the viewport as well as the element, and stores nothing. This
    // is what lets `$options` stay a read-only view — there is no moment at
    // which a breakpoint change has to write a value in.
    const fromElement = (attributeName: string) => el.getAttribute(attributeName);
    const rawValue = () => responsiveRawValue(attribute, activeBreakpoint(), fromElement, negated);
    const rawValueAt = (breakpoint: string, get: (attributeName: string) => string | null) =>
      responsiveRawValue(attribute, breakpoint, get, negated);
    const owns = (attributeName: string) =>
      isResponsiveAttribute(attribute, attributeName) ||
      (negated !== undefined && isResponsiveAttribute(negated, attributeName));

    readers.set(name, { attribute, rawValue, rawValueAt, owns, read });
    Object.defineProperty(options, name, {
      enumerable: true,
      get: () => read(rawValue()),
    });
  }
  return options;
}

const resolvedConfigs = new WeakMap<BaseConstructor, BaseConfig>();

/**
 * Merge inherited config. Collections merge; declared scalar values override parent values.
 *
 * The registry uses this before an instance exists.
 */
export function resolveConfig(ctor: BaseConstructor): BaseConfig {
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

/** Reserved handler prefixes for global targets. They take precedence over child and ref names. */
const GLOBAL_PREFIXES = ['Window', 'Document'] as const;

/** Resolve a global handler prefix only when an event name follows it. */
function resolveGlobal(rest: string): { target: Window | Document; type: string } | null {
  for (const prefix of GLOBAL_PREFIXES) {
    if (rest.length > prefix.length && rest.startsWith(prefix)) {
      return {
        target: prefix === 'Window' ? window : document,
        type: kebabCase(rest.slice(prefix.length)),
      };
    }
  }
  return null;
}

/** Return inherited prototype handler names. Class fields are not included. */
function handlerMethodNames(ctor: BaseConstructor): string[] {
  const names = new Set<string>();
  let proto: object | null = ctor.prototype;
  while (proto && proto !== Base.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (REGEX_HANDLER.test(name)) {
        names.add(name);
      }
    }
    proto = Object.getPrototypeOf(proto) as object | null;
  }
  return [...names];
}

/**
 * One resolved magic handler: which listener to create, and where, for an
 * `on<…>` method name — everything but the instance to call it on.
 */
type HandlerPlanEntry = { method: string; type: string } & (
  | { kind: 'global'; target: Window | Document }
  /** The declared child name. */
  | { kind: 'child'; name: string }
  /** The **declared** ref, `[]` included: it is what `queryRefs()` takes. */
  | { kind: 'ref'; name: string }
  | { kind: 'own' }
);

interface HandlerPlan {
  /** Declared child names, longest first. */
  childNames: string[];
  /** Declared refs, longest derived name first. */
  refs: Array<{ name: string; definition: string }>;
  componentName: string;
  entries: HandlerPlanEntry[];
}

/**
 * Resolve and cache each class's handler plan.
 *
 * Keep the `@__PURE__` annotation so bundlers can remove unused handler planning.
 */
const handlerPlan = /* @__PURE__ */ memo((ctor: BaseConstructor): HandlerPlan => {
  const config = resolveConfig(ctor);
  // Longest name first, so `onSliderDragStart` resolves to the declared
  // `SliderDrag` child, not to `Slider`.
  const byLength = (a: string, b: string) => b.length - a.length;
  const childNames = Object.keys(config.components ?? {}).sort(byLength);
  // Keep both declared and derived ref names; list refs differ by `[]`.
  const refs = (config.refs ?? [])
    .map((definition) => ({ name: refPropertyName(definition), definition }))
    .sort((a, b) => byLength(a.name, b.name));

  // The global prefixes are matched first because they are reserved; children
  // are matched before refs, so a name declared as both resolves to the
  // component.
  const entries = handlerMethodNames(ctor).map((method): HandlerPlanEntry => {
    const rest = method.slice(2);
    const global = resolveGlobal(rest);
    if (global) {
      return { kind: 'global', method, type: global.type, target: global.target };
    }
    const startsWith = (name: string) =>
      rest.startsWith(capitalize(name)) && rest.length > name.length;
    const childName = childNames.find(startsWith);
    if (childName) {
      return {
        kind: 'child',
        method,
        type: kebabCase(rest.slice(childName.length)),
        name: childName,
      };
    }
    const ref = refs.find(({ name }) => startsWith(name));
    if (ref) {
      return {
        kind: 'ref',
        method,
        type: kebabCase(rest.slice(ref.name.length)),
        name: ref.definition,
      };
    }
    return { kind: 'own', method, type: kebabCase(rest) };
  });

  return { childNames, refs, componentName: config.name, entries };
});

/** One handler waiting on a descendant, resolved at event time. */
type DelegatedEntry =
  | { kind: 'child'; name: string; invoke: (payload: DelegatedEvent) => void }
  // `name` here is the **declared** ref, suffix included: it is compared
  // against the `data-ref` attribute and handed to `queryRefs()`.
  | { kind: 'ref'; name: string; invoke: (payload: RefEvent) => void };

type DelegatedEntries = Map<string, DelegatedEntry[]>;

function addDelegated(delegated: DelegatedEntries, type: string, entry: DelegatedEntry): void {
  if (!delegated.has(type)) {
    delegated.set(type, []);
  }
  delegated.get(type)?.push(entry);
}

/**
 * `mounted()` may return one cleanup, several, nothing — or a promise of
 * those. The shape nests, so a subclass composes with what it extends
 * without unpacking it: `return [super.mounted(), () => { … }]`.
 */
export type MountedReturn = void | (() => void) | MountedReturn[] | Promise<MountedReturn>;

function reportLifecycleFailure(instance: Base, message: string, error: unknown): void {
  reportDiagnostic('component.lifecycle-failed', message, error, {
    component: instance.$config.name,
    target: instance.$el,
  });
}

/** What `#guard()` returns instead of a value when the guarded call threw. */
const GUARD_FAILED = Symbol('guard-failed');

export class Base<T extends BaseProps = BaseProps> {
  /** A class-owned brand inherited by subclasses and shared by bundled copies. */
  static readonly [BASE_BRAND] = true;

  static config: BaseConfig = { name: 'Base' };

  /**
   * Phantom carrier for the props type: type-only, never assigned, so
   * another component can read this one's declared surface.
   */
  declare readonly __props?: T;

  /**
   * Unique, stable instance id (`<ComponentName>-<sequence>`).
   *
   * Generated once during construction from the resolved component name. It
   * stays unchanged across destroy and remount cycles, so a component can use
   * it for persistent ARIA relationships without changing the DOM id itself.
   */
  readonly $id: string;

  $el: El<T>;

  /**
   * Live view over the component's `data-ref` elements: every access
   * re-reads the DOM, so replaced markup is picked up with nothing to
   * refresh.
   */
  $refs: Refs<T> = {};

  $options: Options<T> = {};

  #isMounted = false;

  /** Per-mount-cycle listeners, removed on every `$destroy()`. */
  #listeners: Array<[string, EventListener, EventTarget, boolean]> = [];

  /** Per-mount-cycle cleanups (service unsubscriptions, `mounted()` return values). */
  #destroyCallbacks: Array<() => void> = [];

  /** Cleanup returned by each active `option<Name>Changed()` effect. */
  #optionCleanups = new Map<string, () => void>();

  /** Increments on mount so a reentrant effect cannot attach to a later cycle. */
  #mountCycle = 0;

  /**
   * The `$watchChildren()` watchers this instance owns. The shared destroy
   * listener only holds weak references to them, so this field is what keeps
   * them alive — and what lets them die with their owner.
   */
  #childrenWatchers: ChildrenWatcher[] = [];

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
    const { name } = this.$config;
    this.$id = `${name}-${componentId}`;
    componentId += 1;
    this.$el = el;
    el[INSTANCES] ??= new Map();
    el[INSTANCES].set(name, this);
    // Both views resolve on access, so they are built once and stay correct
    // for the instance's whole life.
    this.$options = buildOptions(this);
    this.$refs = buildRefs(this);
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

  /**
   * Mount the instance. Mounting is reversible: `$destroy()` is its inverse
   * and the same instance can mount again — this is what happens when an
   * element is moved or re-inserted in the DOM.
   */
  $mount(): this {
    if (this.#isMounted) {
      return this;
    }
    this.#bindHandlers();
    this.#isMounted = true;
    this.#mountCycle += 1;
    const cycle = this.#mountCycle;
    this.#initializeOptionEffects(cycle);
    if (!this.#isActiveMountCycle(cycle)) {
      return this;
    }
    this.#initializeResponsiveOptions(cycle);
    if (!this.#isActiveMountCycle(cycle)) {
      return this;
    }
    this.#guard('`mounted()` failed.', () => this.#collectCleanup(this.mounted(), cycle));
    if (!this.#isActiveMountCycle(cycle)) {
      return this;
    }
    // Announce the mounted instance to ancestors.
    const detail: LifecycleEventDetail = { instance: this };
    this.$el.dispatchEvent(
      new CustomEvent(EVENTS.component.mounted, { bubbles: true, cancelable: false, detail }),
    );
    return this;
  }

  /**
   * Unmount the instance — the reversible inverse of `$mount()`. Removes the
   * per-cycle listeners, leaves the services, cancels the scheduler tasks the
   * cycle left pending, runs the `mounted()` cleanups and calls the
   * `destroyed()` hook. The instance stays on its element and can mount again.
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
    // Cancel cycle work before cleanup. Tasks scheduled by cleanup must remain active.
    const pending = this.#tasks;
    this.#tasks = new Set();
    for (const task of pending) {
      task.cancel();
    }
    const callbacks = this.#destroyCallbacks;
    this.#destroyCallbacks = [];
    for (const callback of callbacks) {
      this.#guard('A mount cleanup failed.', callback);
    }
    this.#clearOptionEffects();
    this.#guard('`destroyed()` failed.', () => this.destroyed());
    // The element may already be detached, so a bubbling event would reach
    // nobody: announce from the document instead.
    const detail: LifecycleEventDetail = { instance: this };
    document.dispatchEvent(
      new CustomEvent(EVENTS.component.destroyed, { cancelable: false, detail }),
    );
    return this;
  }

  /**
   * Dispatch a bubbling, cancelable event with the payload as `detail`.
   *
   * @returns The dispatched event. Check `defaultPrevented` for cancellation.
   */
  $emit<K extends EmitName<T>>(event: K, ...payload: EmitArgs<T, K>): CustomEvent<EmitDetail<T, K>>;
  $emit(event: string, payload?: object): CustomEvent<unknown> {
    checkPayload(this, event, payload);
    return this.#dispatch(event, payload);
  }

  /** Build and dispatch a component event. */
  #dispatch(event: string, detail: unknown): CustomEvent<unknown> {
    const dispatched = new CustomEvent(event, { bubbles: true, cancelable: true, detail });
    this.$el.dispatchEvent(dispatched);
    return dispatched;
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
      .map((el) => el[INSTANCES]?.get(name))
      .filter((instance): instance is T => Boolean(instance?.$isMounted));
  }

  /**
   * Nearest mounted ancestor instance by component name.
   */
  $closest<T extends Base = Base>(name: string): T | null {
    let el = this.$el.parentElement;
    while (el) {
      const instance = el[INSTANCES]?.get(name);
      if (instance?.$isMounted) {
        return instance as T;
      }
      el = el.parentElement;
    }
    return null;
  }

  /**
   * Return a live, DOM-ordered collection of mounted descendants.
   *
   * A string matches `config.name`. A class also matches subclasses.
   */
  $watchChildren<T extends Base = Base>(
    name: string,
    callbacks?: WatchChildrenCallbacks<T>,
  ): ChildrenCollection<T>;
  $watchChildren<T extends BaseConstructor>(
    ComponentClass: T,
    callbacks?: WatchChildrenCallbacks<InstanceType<T>>,
  ): ChildrenCollection<InstanceType<T>>;
  $watchChildren<T extends Base = Base>(
    target: string | BaseConstructor,
    callbacks: WatchChildrenCallbacks<T> = {},
  ): ChildrenCollection<T> {
    const instances = new Set<T>();
    const matches = (instance: Base): instance is T =>
      typeof target === 'string' ? instance.$config.name === target : instance instanceof target;
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

    // Defer callbacks until construction completes; listeners attach before the sweep.
    queueMicrotask(() => {
      if (typeof target === 'string') {
        for (const instance of this.$query<T>(target)) {
          add(instance);
        }
        return;
      }
      // Constructor matching must inspect instances because subclasses can use other tokens.
      for (const el of this.$el.querySelectorAll('*')) {
        for (const instance of el[INSTANCES]?.values() ?? []) {
          if (instance.$isMounted && matches(instance)) {
            add(instance);
          }
        }
      }
    });

    const onMounted = (event: Event) => {
      const { instance } = (event as CustomEvent<LifecycleEventDetail>).detail;
      if (instance.$isMounted && matches(instance)) {
        add(instance);
      }
    };
    // Destroyed instances announce from `document`, because their elements can
    // be detached. The instance keeps its own watchers, and the shared listener
    // reaches them weakly, so watching children adds no reference from the
    // document to this component.
    const watcher: ChildrenWatcher = (instance) => {
      if (matches(instance)) {
        remove(instance);
      }
    };
    this.#childrenWatchers.push(watcher);
    registerChildrenWatcher(watcher);
    // Instance-lifetime, so neither registration is released: the collection
    // survives destroy and mount cycles, and both ends die with the instance —
    // the mount listener with the element it sits on, the watcher with the
    // field above.
    this.$el.addEventListener(EVENTS.component.mounted, onMounted);

    return {
      get size() {
        return instances.size;
      },
      get items() {
        return [...instances].sort((a, b) => compareDocumentOrder(a.$el, b.$el));
      },
      [Symbol.iterator]() {
        return this.items[Symbol.iterator]();
      },
    };
  }

  /**
   * Provide a value verbatim to the subtree for as long as the element lives.
   * The nearest provider wins.
   *
   * The provider sits on the element, not on the mount cycle, so it answers
   * through every destroy and mount. Nothing releases it early: a component
   * whose declaration is withdrawn keeps providing until its element goes.
   */
  $provide<V>(key: ContextKey<V>, value: V): V {
    provideContext(this.$el, key, value);
    return value;
  }

  /**
   * Resolve the nearest value now or when a provider appears. The request remains pending without a provider and is canceled on destroy.
   */
  $inject<V>(key: ContextKey<V>): Promise<V> {
    const { promise, cancel } = injectContext(this.$el, key);
    this.#destroyCallbacks.push(cancel);
    return promise;
  }

  /** Resolve the nearest value now, or return `undefined` without queuing a request. */
  $injectSync<V>(key: ContextKey<V>): V | undefined {
    return injectContextSync(this.$el, key);
  }

  /**
   * Apply one mutation batch after declaration reconciliation. Option cleanup runs before the next value and on destroy. Only resolved value changes trigger effects.
   *
   * @internal
   */
  $optionsChanged(changes: ReadonlyMap<string, string | null>): void {
    if (!this.#isMounted) {
      return;
    }
    const before = (attributeName: string) =>
      changes.has(attributeName)
        ? (changes.get(attributeName) ?? null)
        : this.$el.getAttribute(attributeName);

    for (const [name, reader] of optionReaders.get(this) ?? []) {
      // The base attribute is one lookup; any of the scoped spellings may be
      // the one the cascade was selecting, so a miss asks about every changed
      // name before giving up.
      let touched = changes.has(reader.attribute);
      if (!touched) {
        for (const attributeName of changes.keys()) {
          if (reader.owns(attributeName)) {
            touched = true;
            break;
          }
        }
      }
      if (!touched) {
        continue;
      }
      const previousRawValue = reader.rawValueAt(activeBreakpoint(), before);
      if (isNetChange(reader.rawValue(), previousRawValue)) {
        this.#runOptionEffect(name, reader, previousRawValue, false);
      }
    }
  }

  /** Schedule a DOM read; canceled automatically when the instance unmounts. */
  $read<T>(fn: () => T): ScheduledTask<T> {
    return this.#track(defaultScheduler.read(fn));
  }

  /** Schedule a DOM write; canceled automatically when the instance unmounts. */
  $write<T>(fn: () => T): ScheduledTask<T> {
    return this.#track(defaultScheduler.write(fn));
  }

  #track<T>(task: ScheduledTask<T>): ScheduledTask<T> {
    this.#tasks.add(task);
    const finished = () => this.#tasks.delete(task);
    void task.promise.then(finished, finished);
    return task;
  }

  #isActiveMountCycle(cycle: number): boolean {
    return this.#isMounted && this.#mountCycle === cycle;
  }

  /**
   * Run a hook or a cleanup owned by the component. A throw there must not
   * abandon the framework bookkeeping which follows it, so it is reported and
   * swallowed; the sentinel lets the few callers which care tell a failure
   * from a value the call returned.
   */
  #guard<T>(message: string, run: () => T): T | typeof GUARD_FAILED {
    try {
      return run();
    } catch (error) {
      reportLifecycleFailure(this, message, error);
      return GUARD_FAILED;
    }
  }

  #initializeOptionEffects(cycle: number): void {
    for (const [name, reader] of optionReaders.get(this) ?? []) {
      if (!this.#isActiveMountCycle(cycle)) {
        return;
      }
      this.#runOptionEffect(name, reader, null, true);
    }
  }

  /** Subscribe to breakpoint changes for this mount cycle only when an option effect exists. */
  #initializeResponsiveOptions(cycle: number): void {
    const readers = optionReaders.get(this);
    if (!readers || readers.size === 0) {
      return;
    }
    // Scan attributes once per mount for unknown breakpoint suffixes.
    checkResponsiveAttributes(
      this.$el,
      [...readers.values()].map((reader) => reader.attribute),
    );

    const announces = [...readers.keys()].some(
      (name) => optionChangedHandler(this, name) !== undefined,
    );
    if (!announces) {
      return;
    }

    this.#collectCleanup(
      watchBreakpoint((previous) => {
        const fromElement = (attributeName: string) => this.$el.getAttribute(attributeName);
        for (const [name, reader] of readers) {
          // The attributes did not move; the viewport did. A crossing is only a
          // change to the options whose cascade now selects a different one.
          const previousRawValue = reader.rawValueAt(previous, fromElement);
          if (isNetChange(reader.rawValue(), previousRawValue)) {
            this.#runOptionEffect(name, reader, previousRawValue, false);
          }
        }
      }),
      cycle,
    );
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
      this.#guard(`Option "${name}" cleanup failed.`, previousCleanup);
    }
    if (!this.#isMounted) {
      return;
    }

    const handler = optionChangedHandler(this, name);
    if (!handler) {
      return;
    }

    const cycle = this.#mountCycle;
    const cleanup = this.#guard(`\`${optionChangedMethod(name)}()\` failed.`, () => {
      const rawValue = reader.rawValue();
      const change: OptionChange = {
        name,
        value: reader.read(rawValue),
        previousValue: initial ? undefined : reader.read(previousRawValue),
        rawValue,
        previousRawValue,
        initial,
      };
      return handler.call(this, change);
    });
    if (cleanup === GUARD_FAILED) {
      return;
    }
    if (typeof cleanup === 'function') {
      if (this.#isMounted && this.#mountCycle === cycle) {
        this.#optionCleanups.set(name, cleanup);
      } else {
        this.#guard(`Option "${name}" cleanup failed.`, cleanup);
      }
    }
  }

  #clearOptionEffects(): void {
    const cleanups = this.#optionCleanups;
    this.#optionCleanups = new Map();
    for (const [name, cleanup] of cleanups) {
      this.#guard(`Option "${name}" cleanup failed.`, cleanup);
    }
  }

  /**
   * Register the cleanup value returned by `mounted()`. Async hooks are
   * awaited; if their mount cycle ended in the meantime, the cleanup runs
   * right away instead of leaking into a later cycle.
   */
  #collectCleanup(result: MountedReturn, cycle: number): void {
    if (typeof result === 'function') {
      if (this.#isActiveMountCycle(cycle)) {
        this.#destroyCallbacks.push(result);
      } else {
        // The originating mount cycle ended while an async result was pending:
        // run the cleanup right away instead of leaking.
        this.#guard('A late mount cleanup failed.', result);
      }
      return;
    }
    if (Array.isArray(result)) {
      for (const item of result) {
        this.#collectCleanup(item, cycle);
      }
      return;
    }
    if (result instanceof Promise) {
      result
        .then((resolved) => this.#collectCleanup(resolved, cycle))
        .catch((error) => {
          reportLifecycleFailure(this, '`mounted()` failed.', error);
        });
    }
  }

  /** Bind root, delegated child/ref and global handlers for the current mount cycle. Delegated handlers resolve dynamic descendants at event time. */
  #bindHandlers(): void {
    // Resolve class-level handler metadata once.
    const plan = handlerPlan(this.constructor as BaseConstructor);
    const delegated: DelegatedEntries = new Map();
    // Decorated handlers win: both passes name a method the same way, so the
    // names bound here are what tells the second pass to skip them.
    const decorated = this.#bindDecoratedHandlers(plan, delegated);
    this.#bindPlannedHandlers(plan, delegated, decorated);
    this.#installDelegatedListeners(plan.componentName, delegated);
  }

  #bindOwn(type: string, invoke: (event: Event) => void): void {
    const listener: EventListener = (event) => invoke(event);
    this.$el.addEventListener(type, listener);
    this.#listeners.push([type, listener, this.$el, false]);
  }

  /** Bind a global handler in bubble phase for the current mount cycle. Capture is only for delegated non-bubbling events. */
  #bindGlobal(
    target: Window | Document,
    type: string,
    invoke: (payload: GlobalEvent) => void,
  ): void {
    const listener: EventListener = (event) => invoke({ event, target });
    target.addEventListener(type, listener);
    this.#listeners.push([type, listener, target, false]);
  }

  /**
   * Bind the decorated handlers, which already carry resolved targets and
   * event types, and return the method names they bound.
   */
  #bindDecoratedHandlers(plan: HandlerPlan, delegated: DelegatedEntries): Set<string | symbol> {
    const { childNames, refs } = plan;
    const registrations = this[HANDLER_REGISTRATIONS] ?? [];
    const decorated: Set<string | symbol> = new Set(registrations.map(({ method }) => method));
    for (const { target, child, type, handler } of registrations) {
      if (target) {
        this.#bindGlobal(target, type, (payload) => handler.call(this, payload));
      } else if (child) {
        // Decorators use the declared ref name, including `[]`.
        const declaredChild = childNames.includes(child);
        const ref = declaredChild ? undefined : refs.find(({ definition }) => definition === child);
        if (!declaredChild && !ref) {
          warnRefSuffixMismatch(this, child, refs);
        }
        addDelegated(delegated, type, {
          kind: ref ? 'ref' : 'child',
          name: child,
          invoke: (payload: DelegatedEvent | RefEvent) => handler.call(this, payload),
        });
      } else {
        this.#bindOwn(type, (event) => handler.call(this, event));
      }
    }
    return decorated;
  }

  /** Bind the undecorated magic handlers from the cached class plan. */
  #bindPlannedHandlers(
    plan: HandlerPlan,
    delegated: DelegatedEntries,
    decorated: Set<string | symbol>,
  ): void {
    const self = this as unknown as Record<string, (payload: unknown) => void>;
    for (const entry of plan.entries) {
      const { method, type } = entry;
      if (decorated.has(method)) {
        continue;
      }
      // Read through the instance, deliberately: a class field can shadow a
      // prototype method with something that is not callable, and the plan
      // lists the name either way.
      if (typeof self[method] !== 'function') {
        continue;
      }
      if (entry.kind === 'global') {
        this.#bindGlobal(entry.target, type, (payload) => self[method](payload));
      } else if (entry.kind === 'own') {
        this.#bindOwn(type, (event) => self[method](event));
      } else {
        addDelegated(delegated, type, {
          kind: entry.kind,
          name: entry.name,
          invoke: (payload: DelegatedEvent | RefEvent) => self[method](payload),
        });
      }
    }
  }

  /** Install one root listener per delegated event type. */
  #installDelegatedListeners(componentName: string, delegated: DelegatedEntries): void {
    for (const [type, entries] of delegated) {
      const listener: EventListener = (event) => {
        let el = event.target instanceof Element ? event.target : null;
        while (el && el !== this.$el) {
          let invoked = false;
          for (const entry of entries) {
            if (this.#invokeDelegated(entry, el, event, componentName)) {
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

  /**
   * Fire one delegated entry when `el` is what it waits on: a mounted child
   * instance, or an owned ref. Returns whether it fired, which is how the
   * walk knows it reached the nearest matching element.
   */
  #invokeDelegated(
    entry: DelegatedEntry,
    el: Element,
    event: Event,
    componentName: string,
  ): boolean {
    if (entry.kind === 'child') {
      const child = el[INSTANCES]?.get(entry.name);
      if (!child?.$isMounted) {
        return false;
      }
      entry.invoke({
        event,
        target: child,
        // The detail verbatim — what a plain listener reads.
        payload: (event as CustomEvent).detail,
      });
      return true;
    }
    if (!isRefOf(el, this.$el, componentName, entry.name)) {
      return false;
    }
    entry.invoke({
      event,
      target: el,
      // The index within the ref list as `$refs` sees it, so the two
      // spellings share one numbering.
      index: queryRefs(this.$el, componentName, entry.name).indexOf(el),
    });
    return true;
  }
}
