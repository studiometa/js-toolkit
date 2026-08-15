import { componentTokens } from './component-declarations.js';
import {
  injectContext,
  injectContextSync,
  provideContext,
  type ContextKey,
  type InjectContextOptions,
} from './context.js';
import { domVersion, watchElementAttributes, type AttributeChange } from './dom-mutations.js';
import { reportToolkitError } from './errors.js';
import {
  domUpdate,
  emitExtendable,
  DOM_UPDATE_EVENT,
  type DomMutation,
} from './negotiated-events.js';
import { DESTROYED_EVENT, MOUNTED_EVENT } from './lifecycle-events.js';
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

/**
 * Imports the module a component lives in. Anything resolving to the class
 * works — the class itself, the module namespace, a `default` export.
 *
 * `Promise<unknown>` is what `() => import('./Child.js')` actually produces:
 * a module namespace nothing has typed yet. Narrowing it further would only
 * reject correct code, so the shape is checked where it is known — when the
 * promise resolves, by `resolveComponentClass()`.
 */
export type ComponentImporter = () => Promise<unknown>;

export interface BaseConfig {
  name: string;
  /**
   * The components this one declares, by name.
   *
   * A value is the child's class, or a thunk importing it:
   *
   *     components: {
   *       Other: OtherClass,
   *       Child: () => import('./Child.js'),
   *     }
   *
   * A thunk is registered, never called, when the parent registers: the map
   * **key** is the component name, which is what lets a name be known with
   * nothing imported. So a manifest may declare only the parent, the parent
   * owns when its children load, and a lazy child is its own chunk instead
   * of being pulled into its parent's.
   */
  components?: Record<string, BaseConstructor | ComponentImporter>;
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
 * Payload given to `onWindow<Event>` / `onDocument<Event>` handlers.
 *
 * `target` is the global the handler named, which keeps the vocabulary of the
 * two delegated shapes: `target` is always whatever the handler resolved to —
 * the child instance, the ref element, or here the global target. There is no
 * `payload`, because a global event is a platform event rather than a
 * component's own announcement, and no `index`, because there is nothing to
 * index. The event is the whole payload:
 *
 *     onDocumentClick({ event }: GlobalEvent<MouseEvent>) {
 *       if (!event.composedPath().includes(this.$el)) this.$emit('click-outside');
 *     }
 */
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
  /**
   * `object` rather than `Record<string, unknown>`, and the reason is
   * REPORT.md gap 14: an interface has no implicit index signature, so an
   * option set **named** to be shared between two components —
   * `interface SliderOptions { … }` — failed the constraint, with an error
   * pointing at the props type rather than at the interface. It bit exactly
   * when naming the set was worth doing.
   *
   * Nothing is lost by relaxing it. The constraint rejected no option value:
   * they are `unknown`. `Options<T>` intersects `Record<string, unknown>` back
   * in, so an undeclared option still reads as `unknown` and a declared one
   * keeps its exact type.
   *
   * `$refs` and `$emits` keep their stricter constraints, because those do
   * reject something — a ref that is not an element, an event payload that is
   * not an object — and a named interface for either is still written as
   * `type MyProps = BaseProps & { $refs: MyRefs }`. The intersection form
   * accepts an interface where `interface MyProps extends BaseProps` cannot.
   */
  $options?: object;
  $emits?: EmitMap;
}

/**
 * What `$emits` maps an event name to: the payload object the event carries,
 * or `void` for one that carries nothing.
 */
export type EmitMap = Record<string, object | void>;

/*
 * ---------------------------------------------------------------------------
 * Reading a prop out of the props type
 * ---------------------------------------------------------------------------
 *
 * Every prop below is read as an **intersection** with the framework default,
 * never as `T['$x'] extends … ? … : Default`. The difference is the whole
 * reason a component can take a props parameter:
 *
 *     class Action<T extends BaseProps = BaseProps> extends Base<ActionProps & T> {
 *       mounted() { this.$options.target; }
 *     }
 *
 * TypeScript only resolves a conditional type once its checked type is
 * concrete, and inside that class body `T` is a naked type parameter — so a
 * conditional over `T['$options']` stays deferred and every option reads as the
 * fallback, whatever `ActionProps` said. An intersection has no such gate: the
 * apparent type of `A & B` is the intersection of the apparent types, so the
 * declared half answers straight away and a deferred half contributes its
 * constraint. `BaseProps` declares every key optional, and a props type may
 * leave a key out entirely — an omitted key reads as `unknown` through an
 * indexed access — and the intersection absorbs both: `undefined & X` is
 * `never`, which drops out of the union, and `unknown & X` is `X`.
 *
 * This is v3's technique, `$el: T['$el'] & BaseEl` in
 * `packages/js-toolkit/src/Base/Base.ts`, and it is v3 having no conditional
 * here that lets v3 components take a props parameter at all.
 *
 * The second reason to prefer it: a conditional over `T` makes the class
 * **invariant** in `T`, because two conditionals with different checked types
 * are unrelated in both directions. `Base<SliderProps>` would stop being
 * assignable to `Base`, which is what `$query`, `$closest` and
 * `$watchChildren` hand back. An intersection measures as covariant and they
 * keep working.
 *
 * The price, also v3's: intersecting `Record<string, unknown>` in brings its
 * index signature along, so reading an option a component did not declare is
 * `unknown` rather than an error. Declared options keep their exact types,
 * which is what the declaration is for.
 */

type El<T extends BaseProps> = T['$el'] & HTMLElement;

type Refs<T extends BaseProps> = T['$refs'] & Record<string, HTMLElement | HTMLElement[]>;

type Options<T extends BaseProps> = T['$options'] & Record<string, unknown>;

/**
 * The `$emits` map, resolved.
 *
 * The odd one out: `keyof (Declared & EmitMap)` is `string`, so intersecting
 * the default in unconditionally would throw away every declared name. The
 * default is contributed by a conditional instead — but one checked against
 * `unknown`, which is exactly the type an omitted key reads as, so it fires for
 * an omitted `$emits` and for nothing else. Deferred over a naked `T` like any
 * conditional, and harmless there: the branches are `EmitMap` and `unknown`,
 * whose union is `unknown`, so the deferred half contributes nothing to the
 * intersection and `NonNullable<T['$emits']>` answers on its own.
 */
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

/**
 * Written `void extends M[K]` rather than `M[K] extends void` so the checked
 * type is the concrete `void` and only the `extends` side mentions the props
 * parameter. TypeScript relates an argument to a conditional in that shape by
 * relating it to both branches, which it can do here — they differ only in
 * whether the payload is optional. The other way round the type is deferred
 * whole, and `$emit()` rejects every argument list a generic component gives it.
 */
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
 *
 * `owner` names the component a **namespaced** ref addressed by name, and it
 * changes what counts as a boundary. A plain `data-ref="next"` stops at the
 * nearest component of any kind; `data-ref="Slider.next"` stops only at
 * another `Slider`, so it reaches past whatever else is in the way. That is
 * the whole point of the namespace, and it is v3's rule
 * (`RefsManager.refBelongToInstance()`) unchanged.
 *
 * The root itself is never tested against `owner`. It cannot be: ui registers
 * `FigureShopify` under the name `Figure`, so the element reading
 * `data-ref="FigureShopify.img"` sits under `data-component="Figure"`. The
 * namespace names the **class's** `config.name`, which is what the root's
 * effective declaration matched; the walk only decides who else could have
 * claimed it.
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

/**
 * The suffix that declares a ref as a list.
 *
 * **It is part of the attribute, not only of the declaration.**
 * `config.refs: ['dots[]']` selects `[data-ref="dots[]"]`, and the property is
 * `$refs.dots`. This is v3's spelling (`RefsManager.__register()`), kept
 * because it is the one ui's templates, fixtures and documentation are
 * written in, and because the suffix says in the markup what the markup
 * actually is: one of several, rather than the only one.
 *
 * One spelling, not two: a list definition matches the suffixed attribute and
 * nothing else, exactly as in v3.
 */
const REF_LIST_SUFFIX = '[]';

function isRefList(definition: string): boolean {
  return definition.endsWith(REF_LIST_SUFFIX);
}

/** The name a `config.refs` entry takes in `$refs`, and in `on<Ref><Event>`. */
function refPropertyName(definition: string): string {
  return isRefList(definition) ? definition.slice(0, -REF_LIST_SUFFIX.length) : definition;
}

/**
 * The separator between a ref's namespace and its name.
 *
 * `data-ref="Slider.next"` says *this ref belongs to the enclosing `Slider`*,
 * whatever else stands between them. Without it there is no way to express
 * that at all: `belongsTo()` stops at the first `data-component` it meets, so
 * a ref inside a child component is unreachable from the outside. v3 had the
 * form; v4 dropped it and ui uses it — `App.form` reaches a `Frame`'s form
 * from the app root, `FigureShopify.img` reaches an image wrapped in a
 * `Transition`.
 *
 * It is not a second spelling of the same thing, the way the `[]` question
 * was: the two forms answer two different questions. A plain ref asks for the
 * nearest owner, a namespaced one names its owner.
 */
const REF_NAMESPACE_SEPARATOR = '.';

/**
 * The namespaced spelling of one ref definition.
 *
 * **The namespace wraps the whole definition, suffix included** —
 * `Slider.dots[]`, not `Slider.dots` or `Slider[].dots`. That is v3's order
 * (`RefsManager.__register()` builds `` `${name}.${refName}` `` from the
 * already-suffixed config entry) and it is the order ui's documentation is
 * written in. It also reads correctly: `[]` qualifies the ref, and the
 * namespace qualifies the pair.
 */
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
  const declared = el.getAttribute('data-ref');
  if (declared === definition) {
    return belongsTo(el, root);
  }
  return (
    declared === namespacedRef(componentName, definition) && belongsTo(el, root, componentName)
  );
}

/**
 * The elements currently declaring `definition` inside a component, skipping
 * those owned by a nested component.
 *
 * The parameter is the **declared** name, suffix included; the attribute is
 * spelled the way `config.refs` spells it, optionally prefixed by the
 * component's name.
 *
 * **Two queries rather than one selector list.** `[data-ref="a"],[data-ref="b"]`
 * costs Chromium its single-attribute fast path: measured over a 25-element
 * subtree, the cold lookup went 8.0 → 11.2 µs when it matches and 1.2 → 3.4 µs
 * when it does not, against 8.7 µs and 2.1 µs for two separate queries. Since
 * `queryRefs()` runs once per ref per cache miss, and since almost every ref in
 * practice uses the plain spelling, the plain query keeps its fast path and the
 * namespaced one is a second cheap query that usually returns nothing. Merging
 * only pays for `compareDocumentPosition` in the one case that needs it: a ref
 * written both ways under the same component.
 */
function queryRefs(root: HTMLElement, componentName: string, definition: string): HTMLElement[] {
  const plain = [...root.querySelectorAll<HTMLElement>(`[data-ref="${definition}"]`)].filter((el) =>
    belongsTo(el, root),
  );
  const namespaced = root.querySelectorAll<HTMLElement>(
    `[data-ref="${namespacedRef(componentName, definition)}"]`,
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
  return [...plain, ...owned].sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  );
}

/**
 * Say so when a list ref resolves to nothing and the unsuffixed spelling is
 * sitting right there in the markup.
 *
 * The suffix is easy to leave out of the attribute once it has been written in
 * the config, and the failure is silent: the ref resolves to `[]` and the
 * component simply does nothing. This turns that into one console warning
 * naming the element to fix.
 *
 * Checked once per instance and per ref, and only when the ref found nothing,
 * so correct markup never pays for it and broken markup pays one
 * `querySelector` in total.
 */
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
  if (!instance.$el.querySelector(`[data-ref="${name}"],[data-ref="${namespaced}"]`)) {
    return;
  }
  console.warn(
    `[base] \`${instance.$config.name}\` declares \`${definition}\` and found no \`data-ref="${definition}"\`, but the markup declares \`data-ref="${name}"\`. A list ref carries the \`[]\` in the attribute too: add it, or drop it from \`config.refs\`.`,
  );
}

/**
 * Say so when `@on()` names a ref by the spelling its **property** uses rather
 * than the one its **declaration** uses.
 *
 * One rule covers both: **the declaration spelling is what you write to refer
 * to the entry, the property spelling is what you write when a name is derived
 * from it.** `config.refs: ['dots[]']`, `data-ref="dots[]"` and
 * `@on('dots[]', 'click')` all refer to the entry, so all three carry the
 * suffix; `$refs.dots` and `onDotsClick()` derive a name from it, so neither
 * does. One spelling each, never two — the same choice
 * {@link warnMissingRefSuffix} enforces for the attribute.
 *
 * `@on('dots', 'click')` therefore matches nothing and binds a listener that
 * can never fire. There is no type to catch it: the decorator sees a string and
 * cannot read the class's `config.refs`, which is declared elsewhere in the
 * class body and is not in its type. So it is a warning, raised where both are
 * known — at bind time — and only for the unambiguous case: the name matches no
 * declared component and no declared ref, but its other spelling matches a
 * declared ref. A name matching nothing at all is left alone, because
 * `@on('Child', …)` deliberately needs no `config.components` entry.
 */
function warnRefSuffixMismatch(
  instance: Base,
  child: string,
  refs: Array<{ definition: string }>,
): void {
  const other = isRefList(child) ? refPropertyName(child) : `${child}${REF_LIST_SUFFIX}`;
  if (!refs.some(({ definition }) => definition === other)) {
    return;
  }
  console.warn(
    `[base] \`${instance.$config.name}\` binds \`@on('${child}', …)\`, which matches no component and no ref. The ref is declared \`${other}\`, and \`@on()\` names a ref the way it is declared: write \`@on('${other}', …)\`.`,
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
 * A name declared as `name[]` selects `data-ref="name[]"` and always yields an
 * array under `$refs.name`; a plain name selects `data-ref="name"` and yields
 * the first match. Either selects the namespaced spelling too —
 * `data-ref="<Component>.name[]"` — which is how a ref sitting under another
 * component still names this one as its owner. **The namespace is not part of
 * the property**: `Slider.next` is `$refs.next`.
 */
function buildRefs(instance: Base): Record<string, HTMLElement | HTMLElement[]> {
  const refs: Record<string, HTMLElement | HTMLElement[]> = {};
  const checked = new Set<string>();
  const componentName = instance.$config.name;
  for (const definition of instance.$config.refs ?? []) {
    const isList = isRefList(definition);
    const name = refPropertyName(definition);
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

/**
 * Build the live `$options` view.
 *
 * Values are read from the `data-option-*` attributes on every access, so an
 * attribute is always the source of truth. **Defaults belong to the
 * instance**, not to the class: each one is built once per instance and kept,
 * which is what makes `this.$options.list.push(x)` persist and what stops two
 * components from sharing — and corrupting — the same defaulted object.
 *
 * That is what the contract buys: **a primitive may be a default, anything
 * else needs a factory.** A factory is called once per instance, and an
 * `Array`/`Object` option with no declared default gets an empty one per
 * instance for the same reason. A literal is neither: it lives on the class,
 * so it is warned about rather than repaired.
 */
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

/**
 * Definitions already reported by {@link warnLiteralDefault}, so the message
 * belongs to the declaration rather than to the instance reading it: the
 * definition object is the one the class declared, shared by every instance of
 * it, and by every subclass that inherits it through `resolveConfig()`.
 */
const reportedLiteralDefaults = new WeakSet<object>();

/**
 * Say so when a default is a literal object or array.
 *
 * **The contract is that a primitive may be a default, and anything else needs
 * a factory.** A literal lives on the class, so every instance would read — and
 * mutate — the same object. `TypedOptionDefinition` refuses it at the type
 * level, which settles it for anyone with a build step; this is the same rule
 * said out loud for the no-build path, which never sees a type.
 *
 * Core does not repair it. Copying the literal made an unsupported declaration
 * appear to work, and a shallow copy made it appear to work only one level
 * deep, which is worse: the value is handed over exactly as declared, and the
 * warning says what to write instead.
 */
function warnLiteralDefault(
  componentName: string,
  option: string,
  definition: object,
  declared: object,
): void {
  if (reportedLiteralDefaults.has(definition)) {
    return;
  }
  reportedLiteralDefaults.add(definition);
  const kind = Array.isArray(declared) ? 'array' : 'object';
  console.warn(
    `[base] \`${componentName}\` declares option \`${option}\` with a literal ${kind} default, which every instance of it then shares. Only a primitive may be a default; declare this one as a factory: \`default: () => (…)\`.`,
  );
}

function buildOptions(instance: Base): Record<string, unknown> {
  const options: Record<string, unknown> = {};
  const readers = new Map<string, OptionReader>();
  optionReaders.set(instance, readers);
  const el = instance.$el;
  for (const [name, definition] of Object.entries(instance.$config.options ?? {})) {
    const type = typeof definition === 'function' ? definition : definition.type;
    const declared = typeof definition === 'function' ? undefined : definition.default;
    const attribute = `data-option-${kebabCase(name)}`;

    if (typeof definition !== 'function' && declared !== null && typeof declared === 'object') {
      warnLiteralDefault(instance.$config.name, name, definition, declared);
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

    // Every option is responsive, and it is **derived on read**: the getter
    // consults the viewport as well as the element, and stores nothing. This
    // is what lets `$options` stay a read-only view — there is no moment at
    // which a breakpoint change has to write a value in.
    const fromElement = (attributeName: string) => el.getAttribute(attributeName);
    const rawValue = () => responsiveRawValue(attribute, activeBreakpoint(), fromElement);
    const rawValueAt = (breakpoint: string, get: (attributeName: string) => string | null) =>
      responsiveRawValue(attribute, breakpoint, get);
    const owns = (attributeName: string) => isResponsiveAttribute(attribute, attributeName);

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
 * Merge a class's config with every config declared up its prototype chain,
 * so extending a component never silently drops what the parent declared.
 *
 * `refs`, `options` and `components` merge (v3 merged only `options`, which
 * is what issue #627 reports); scalar keys such as `name` and `mountStrategy`
 * are overridden by the most derived class **that declares one**, which is
 * what the spread does — a subclass restating `name` and nothing else keeps
 * its parent's strategy. The result is cached per constructor.
 *
 * Exported because the registry resolves a mount strategy before any instance
 * exists, so it cannot go through `$config`.
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

/**
 * The prefixes that name a global event target rather than something the
 * component declared. They are **reserved**: `onWindowResize` binds to
 * `window` even in a component whose `config.components` lists a child named
 * `Window`, and `onDocumentClick` binds to `document` even next to a ref
 * named `document`.
 *
 * Reserving them is what makes the resolution readable. The alternative —
 * letting a declared name win — would make the meaning of `onWindowResize`
 * depend on a `config` entry declared elsewhere in the file, and it is
 * asymmetric: a child named `Window` can still be reached explicitly with
 * `@on('Window', 'resize')`, whereas nothing would be left to reach `window`
 * with. The escape hatch exists on one side only, so that is the side which
 * yields.
 */
const GLOBAL_PREFIXES = ['Window', 'Document'] as const;

/**
 * Resolve the part of a handler name that follows `on` against the global
 * prefixes. `null` for anything else, which is every name the child, ref and
 * own-element rules go on to resolve.
 *
 * A bare `onWindow()` is not a global handler: like `on<Ref><Event>`, the
 * prefix must be followed by an event to name, so `onWindow` stays an
 * `on<Event>` handler for the (unlikely) `window` event type.
 */
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

/**
 * Every `on<…>` name declared up a class's prototype chain, most derived
 * first, stopping at `Base` itself.
 *
 * **Names only — whether one resolves to a function is asked of the
 * instance.** A class field can shadow a prototype method with a
 * non-function, so that question has an instance in its answer and cannot be
 * settled here; `#bindHandlers()` asks it, per instance, per entry, at the
 * cost of one `typeof`. What is settled here is the expensive half: the walk,
 * the `getOwnPropertyNames()` per prototype, and the regex per name.
 *
 * Class fields never appear: they are own properties of the instance and this
 * walks prototypes. An `onClick = () => {}` is not a handler in v4, which is
 * v3's rule too.
 */
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
 * What `#bindHandlers()` binds for a class, worked out once for the class.
 *
 * `#bindHandlers()` runs on **every** `$mount()`, and under `data-mount` a
 * component mounts and unmounts as often as it scrolls past. Almost all of
 * that work reads the class and nothing else: the sorted child names, the
 * mapped and sorted refs, the prototype scan, and — per handler name — the
 * global-prefix test, the prefix match against children and refs, and the
 * `kebabCase()` of what is left. None of it can differ between two instances
 * of one class, so it is done for the class. What stays per mount is the
 * closures that call `self[method]` and the `addEventListener()` calls, which
 * is what a mount actually is.
 *
 * **No `clear()`, because nothing can go stale.** The plan is derived from
 * the prototype chain, which is fixed once the class is defined, and from
 * `resolveConfig(ctor)`, which is itself cached per constructor and so is
 * already the same answer for the plan's whole life. A class that gained a
 * handler after its first mount would need a new prototype, which is a new
 * class and a new key.
 *
 * **`/* @__PURE__ *\/` is load-bearing, not decoration.** A top-level call is
 * something a bundler must keep unless told otherwise, and keeping this one
 * keeps everything it references — which is all of `Base`. Every constant
 * subpath (`./DESTROYED_EVENT`, `./MOUNTED_EVENT`, `./SOURCE`) is a
 * re-export *from* `Base.js` and owes its size entirely to `Base` being
 * shaken away, so without the annotation each of them grows from 1.9 kB to
 * 7.7 kB gzip — measured, and the reason the services already annotate their
 * `perTarget()` calls the same way.
 */
const handlerPlan = /* @__PURE__ */ memo((ctor: BaseConstructor): HandlerPlan => {
  const config = resolveConfig(ctor);
  // Longest name first, so `onSliderDragStart` resolves to the declared
  // `SliderDrag` child, not to `Slider`.
  const byLength = (a: string, b: string) => b.length - a.length;
  const childNames = Object.keys(config.components ?? {}).sort(byLength);
  // `definition` is the declaration — what `config.refs` says, what `@on()`
  // names, and what the entry carries into delegation. `name` is the derived
  // spelling, used by `on<Ref><Event>` and by `$refs`; the two differ by the
  // `[]` of a list ref. Neither is ever namespaced: the namespace is written
  // on the attribute, never declared, so `isRefOf()` is what reconciles
  // `Slider.dots[]` in the markup with `dots[]` here.
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
      rest.startsWith(pascalCase(name)) && rest.length > name.length;
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
    this.#initializeResponsiveOptions();
    try {
      this.#collectCleanup(this.mounted());
    } catch (error) {
      console.error('[base] `mounted()` failed:', error);
      reportToolkitError('lifecycle', error, this.$config.name, this.$el);
    }
    // Announce existence to every ancestor (objective 5, layer 1).
    const detail: LifecycleEventDetail = { instance: this };
    this.$el.dispatchEvent(new CustomEvent(MOUNTED_EVENT, { bubbles: true, detail }));
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
    // Before the cleanups, not after. What is cancelled here is the work the
    // mount cycle left in flight — a `$write()` scheduled by a rAF subscriber
    // that is about to be released. Cancelling afterwards also took the work
    // the teardown itself scheduled, so "reset my styles on the way out",
    // written the only way the framework offers, never ran.
    //
    // The set is emptied first so `#track()` can refill it: a task queued from
    // a cleanup, from `destroyed()` or from an option effect's teardown belongs
    // to nobody's cycle and runs on its own. It is no longer cancelled by a
    // later `$destroy()` either, since this instance is already unmounted and
    // the guard above returns early.
    const pending = this.#tasks;
    this.#tasks = new Set();
    for (const task of pending) {
      task.cancel();
    }
    const callbacks = this.#destroyCallbacks;
    this.#destroyCallbacks = [];
    for (const callback of callbacks) {
      try {
        callback();
      } catch (error) {
        console.error('[base] Mount cleanup failed:', error);
        reportToolkitError('lifecycle', error, this.$config.name, this.$el);
      }
    }
    this.#clearOptionEffects();
    try {
      this.destroyed();
    } catch (error) {
      console.error('[base] `destroyed()` failed:', error);
      reportToolkitError('lifecycle', error, this.$config.name, this.$el);
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
        reportToolkitError('lifecycle', error, this.$config.name, this.$el);
      }
    }
    try {
      this.terminated();
    } catch (error) {
      console.error('[base] `terminated()` failed:', error);
      reportToolkitError('lifecycle', error, this.$config.name, this.$el);
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
   * Observe every attribute of the component's own element, whatever its name.
   *
   * `$options` covers the attributes the framework can name: they are declared
   * in `config.options`, so the one page-wide observer can filter for them
   * exactly and `option<Name>Changed()` reports each change. An attribute
   * **the framework cannot enumerate** has no such path — `attributeFilter`
   * takes exact names and the DOM has no wildcard — and a component naming its
   * own attributes (`data-on:<event>`, a `data-bind:` expression) is left
   * reading the DOM once at mount and never hearing about a rewrite:
   *
   *     mounted() {
   *       return this.$watchAttributes(({ name, value, previousValue }) => {
   *         if (name.startsWith('data-on:')) this.rebind(name, value, previousValue);
   *       });
   *     }
   *
   * The subscription is **destroy-scoped**, like the `mounted()` cleanups and
   * a pending `$inject()`: the observer is disconnected on `$destroy()` and a
   * remount re-establishes it, so call it from `mounted()`. Returning the
   * cleanup as well is only for ending it early — nothing is left behind if
   * the return value is dropped, and running it twice is harmless.
   *
   * Delivery is the mutation engine's, not a second timeline: the changes are
   * reported from the same batch as component lifecycle and declared options,
   * after them, and `whenDOMSettled()` waits for them — so a `swap()` that
   * rewrote a watched attribute has already reported it when it resolves.
   * Several writes to one attribute in a batch coalesce to one change against
   * the final DOM value, and a rewrite ending on the value it started from is
   * not a change at all.
   *
   * The element's own attributes only: descendants are a `$refs` question, and
   * one unfiltered observer per opting element is what keeps the cost
   * proportional to the components which ask for it.
   *
   * @param callback Called once per attribute change, with its name, its
   *                 current raw value and the one it replaced (`null` for an
   *                 absent attribute, either side).
   * @returns A cleanup ending the subscription before the next `$destroy()`.
   */
  $watchAttributes(callback: (change: AttributeChange) => void): () => void {
    // A terminated instance never destroys again, so nothing would ever
    // disconnect the observer: refuse rather than leak one.
    if (this.#isTerminated) {
      return () => {};
    }
    const stop = watchElementAttributes(this.$el, (change) => callback.call(this, change));
    this.#destroyCallbacks.push(stop);
    return stop;
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
   * Apply the live declared-option changes of one mutation batch. Called by
   * the registry after it has reconciled component declarations for the batch.
   *
   * The method convention is `option<Name>Changed()`. Its returned cleanup
   * runs before the next value is applied and on destroy.
   *
   * The batch is handed over whole, as `attribute → value before the batch`,
   * rather than one resolved option at a time: an option answers from whichever
   * breakpoint-scoped spelling the cascade selects, so what its previous value
   * was is a question only its own reader can answer. The rule is one rule — a
   * change is one whose **resolved** raw value differs from the resolved raw
   * value before the batch, so rewriting `data-option-columns:s` while the
   * viewport sits at `l` is not a change to `columns`, and neither is a
   * net-zero rewrite.
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
      if (reader.rawValue() !== previousRawValue) {
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

  /**
   * Follow the viewport for the mount cycle, if this component has anything to
   * do about a crossing.
   *
   * "Anything to do" is a declared `option<Name>Changed()`, and the condition
   * is the point: reading an option needs no subscription — the value is
   * derived when it is read — so a component that only reads costs the page
   * nothing at rest. Only a component that has asked to be **told** holds a
   * `matchMedia` listener, and only while it is mounted.
   */
  #initializeResponsiveOptions(): void {
    const readers = optionReaders.get(this);
    if (!readers || readers.size === 0) {
      return;
    }
    // One scan of the element's attributes per mount — not one per option —
    // to report a suffix naming no breakpoint, which is the one way this can
    // fail quietly and the shape v3 markup arrives in.
    checkResponsiveAttributes(
      this.$el,
      [...readers.values()].map((reader) => reader.attribute),
    );

    let announces = false;
    for (const name of readers.keys()) {
      announces ||=
        typeof (this as unknown as Record<string, unknown>)[`option${pascalCase(name)}Changed`] ===
        'function';
    }
    if (!announces) {
      return;
    }

    this.#destroyCallbacks.push(
      watchBreakpoint((previous) => {
        const fromElement = (attributeName: string) => this.$el.getAttribute(attributeName);
        for (const [name, reader] of readers) {
          // The attributes did not move; the viewport did. A crossing is only a
          // change to the options whose cascade now selects a different one.
          const previousRawValue = reader.rawValueAt(previous, fromElement);
          if (reader.rawValue() !== previousRawValue) {
            this.#runOptionEffect(name, reader, previousRawValue, false);
          }
        }
      }),
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
      try {
        previousCleanup();
      } catch (error) {
        console.error(`[base] Option "${name}" cleanup failed:`, error);
        reportToolkitError('lifecycle', error, this.$config.name, this.$el);
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
      const rawValue = reader.rawValue();
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
      reportToolkitError('lifecycle', error, this.$config.name, this.$el);
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
          reportToolkitError('lifecycle', error, this.$config.name, this.$el);
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
        reportToolkitError('lifecycle', error, this.$config.name, this.$el);
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
          reportToolkitError('lifecycle', error, this.$config.name, this.$el);
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
        .catch((error) => {
          console.error('[base] `mounted()` failed:', error);
          reportToolkitError('lifecycle', error, this.$config.name, this.$el);
        });
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
   *
   * `onWindow<Event>` and `onDocument<Event>` bind to the global target they
   * name, for the events a component can never see from its own subtree: a
   * click *outside* it, a `popstate`, a `visibilitychange`. Every one of
   * these listeners is per mount cycle.
   */
  #bindHandlers(): void {
    const self = this as unknown as Record<string, (payload: unknown) => void>;
    // Everything that reads the class and not the instance, resolved once for
    // the class: the sorted child names, the mapped refs, and the target and
    // event type each `on<…>` method name binds to.
    const plan = handlerPlan(this.constructor as BaseConstructor);
    const { childNames, refs, componentName } = plan;

    type Entry =
      | { kind: 'child'; name: string; invoke: (payload: DelegatedEvent) => void }
      // `name` here is the **declared** ref, suffix included: it is compared
      // against the `data-ref` attribute and handed to `queryRefs()`.
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
    /**
     * Bind an `onWindow<Event>` / `onDocument<Event>` handler.
     *
     * **Bubble phase, always** — `CAPTURED_EVENTS` deliberately does not apply
     * here. That set exists for delegation only: a non-bubbling event fired on
     * a descendant never reaches the delegating root during the bubble phase,
     * so the listener has to catch it on the way down. A global handler
     * delegates nothing — it resolves no target by walking up — and its
     * listener already sits at the top of every propagation path, so an event
     * dispatched *at* `window` or `document` reaches it whatever the phase.
     * Capturing would instead change what the handler hears (the `scroll`,
     * `focus` and `mouseenter` of every element on the page, none of it the
     * component's business) and when (before the page's own handlers rather
     * than after). Bubble phase keeps `onDocumentClick` hearing exactly what
     * `document.addEventListener('click', …)` hears, which is what the name
     * promises.
     *
     * Per mount cycle, like every other handler: the listener goes in
     * `#listeners` and `$destroy()` removes it, so a destroyed component stops
     * reacting to window scroll — and a remount rebinds it.
     */
    const bindGlobal = (
      target: Window | Document,
      type: string,
      invoke: (payload: GlobalEvent) => void,
    ) => {
      const listener: EventListener = (event) => invoke({ event, target });
      target.addEventListener(type, listener);
      this.#listeners.push([type, listener, target, false]);
    };

    // Handlers declared with the `@on` decorator: explicit target/type
    // pairs, so no name parsing and no config lookup to resolve them. A
    // global target goes through the very same `bindGlobal()` the magic
    // `onWindow<Event>` / `onDocument<Event>` names use, bubble phase and
    // per-cycle listener included.
    const registrations = this[HANDLER_REGISTRATIONS] ?? [];
    const decorated: Set<unknown> = new Set(registrations.map(({ handler }) => handler));
    for (const { target, child, type, handler } of registrations) {
      if (target) {
        bindGlobal(target, type, (payload) => handler.call(this, payload));
      } else if (child) {
        // `@on()` refers to the entry, so it names a ref the way `config.refs`
        // and the attribute do — `dots[]`, suffix included. `definition` is
        // therefore both what is matched and what the entry carries, which is
        // what `queryRefs()` and the `data-ref` comparison need. The derived
        // spelling `dots` belongs to `$refs.dots` and `onDotsClick()`, and is
        // not a second way to write this one.
        const declaredChild = childNames.includes(child);
        const ref = declaredChild ? undefined : refs.find(({ definition }) => definition === child);
        if (!declaredChild && !ref) {
          warnRefSuffixMismatch(this, child, refs);
        }
        addDelegated(type, {
          kind: ref ? 'ref' : 'child',
          name: child,
          invoke: (payload: DelegatedEvent | RefEvent) => handler.call(this, payload),
        } as Entry);
      } else {
        bindOwn(type, (event) => handler.call(this, event));
      }
    }

    // Magic `onWindow<Event>` / `onDocument<Event>` / `on<Child><Event>` /
    // `on<Ref><Event>` / `on<Event>` method names — the no-build path. Which
    // one each name is was decided for the class; what is left per instance
    // is whether it resolves to a function at all, whether a decorator
    // already claimed it, and the closure that calls it.
    for (const entry of plan.entries) {
      const { method, type } = entry;
      // Read through the instance, deliberately: a class field can shadow a
      // prototype method with something that is not callable, and the plan
      // lists the name either way.
      const handler = self[method] as unknown;
      if (typeof handler !== 'function' || decorated.has(handler)) {
        continue;
      }
      if (entry.kind === 'global') {
        bindGlobal(entry.target, type, (payload) => self[method](payload));
      } else if (entry.kind === 'own') {
        bindOwn(type, (event) => self[method](event));
      } else {
        addDelegated(type, {
          kind: entry.kind,
          name: entry.name,
          invoke: (payload: DelegatedEvent | RefEvent) => self[method](payload),
        } as Entry);
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
            } else if (isRefOf(el, this.$el, componentName, entry.name)) {
              const target = el;
              entry.invoke({
                event,
                target,
                // The index within the ref list as `$refs` sees it, so the two
                // spellings share one numbering.
                index: queryRefs(this.$el, componentName, entry.name).indexOf(target),
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
