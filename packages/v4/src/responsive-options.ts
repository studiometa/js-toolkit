/**
 * Responsive options — one option, several values, chosen by the viewport.
 *
 * **Every** option is responsive, with nothing declared for it. An option is
 * declared in `config.options` and its markup may scope the same attribute to
 * a breakpoint:
 *
 *     options: { columns: { type: Number, default: 1 } }
 *
 *     <div data-component="Grid"
 *          data-option-columns="1"
 *          data-option-columns:s="2"
 *          data-option-columns:l="4"></div>
 *
 * There is no flag, because a flag would only name a thing: the framework
 * already knows the option exists, and an author who writes the scoped
 * attribute has said everything there is to say. The markup is the opt-in.
 *
 * Two rules, and they are the whole feature:
 *
 * - **One breakpoint per attribute**, never a list. v3 spelled a set —
 *   `data-option-columns:xs:s` — which nothing else on the page means: the
 *   breakpoints are `min-width` queries, the utility classes beside them
 *   cascade, and the toolkit alone did set membership. A set is also not
 *   enumerable, and that is not a taste argument: the one mutation observer
 *   filters on **exact** attribute names, so the spellings a component can use
 *   have to be a finite list the framework can write down. The powerset of
 *   eight breakpoints is not; `attribute × breakpoint` is.
 * - **It cascades upwards, like the `min-width` queries it is built on.** The
 *   unsuffixed attribute is the base, and `:s` applies from `s` up until a
 *   wider suffix overrides it. So "from `s` up" is `:s`, where the set spelling
 *   needed `:s:m:l:xl:xxl:xxxl` — a list that silently stopped covering the top
 *   of the range the day a breakpoint was added to the set.
 *
 * Resolution is a **read**, not a stored value: `$options.columns` walks from
 * the active breakpoint down to the base and hands back the first attribute
 * present. Nothing is written, which is what keeps `$options` the read-only
 * view over attributes it is everywhere else.
 */
import { registerDOMOptionAttributes, replaceDOMOptionAttributes } from './dom-mutations.js';
import { breakpointNames, onBreakpointsReplaced, useBreakpoint } from './services/breakpoint.js';
import { memo } from './utils/memo.js';

/**
 * What separates an option's attribute from the breakpoint it is scoped to.
 *
 * Kept from v3, and a colon rather than a dash for a reason that survives the
 * rest of the redesign: a kebab-cased option name can contain a dash, so
 * `data-option-columns-s` is ambiguous between an option `columns` at `s` and
 * an option `columnsS`. A colon can never appear in a kebab-cased name, so the
 * split is exact. Migrating markup keeps its separator; only a multi-breakpoint
 * suffix has to be rewritten.
 */
export const RESPONSIVE_SEPARATOR = ':';

/**
 * The breakpoint-scoped spellings of one attribute, in the set's own order.
 *
 * Built once per attribute and kept, because resolution runs on every read of
 * an option: composing the strings each time would allocate one per candidate
 * per access. Its lifetime is the named set's, which is what `clear()` below
 * is for — the case `maxAge` could not have expressed.
 */
const scopedAttributes = memo((attribute: string): readonly string[] =>
  breakpointNames().map((name) => `${attribute}${RESPONSIVE_SEPARATOR}${name}`),
);

/**
 * The exact scoped spellings for an attribute in the current breakpoint set.
 *
 * Shared with component declarations because the observer filter and both
 * cascades must derive their finite attribute set from the same model.
 *
 * @internal
 */
export function responsiveAttributeNames(attribute: string): readonly string[] {
  return scopedAttributes(attribute);
}

/** Base attributes whose scoped spellings the one observer filters for. */
const observed = new Set<string>();

onBreakpointsReplaced(() => {
  const previous = [...observed].flatMap((attribute) => scopedAttributes(attribute));
  scopedAttributes.clear();
  // The filter takes exact names, so a replaced set means names that were
  // never registered. Replace every derived slice, or a
  // `data-option-x:<new>` rewritten at runtime would be invisible while stale
  // names from the old set kept producing records.
  const next = [...observed].flatMap((attribute) => scopedAttributes(attribute));
  replaceDOMOptionAttributes(previous, next);
});

/**
 * Widen the one mutation observer's filter to an attribute's breakpoint-scoped
 * spellings, so rewriting `data-option-columns:s` at runtime reports a change
 * exactly as rewriting `data-option-columns` does.
 *
 * Called by the registry for `data-component` and for every option a
 * registered component declares — `attribute × breakpoint`, which is why the
 * suffix names one breakpoint rather than a set.
 */
export function observeResponsiveAttribute(attribute: string): void {
  observed.add(attribute);
  registerDOMOptionAttributes(scopedAttributes(attribute));
}

/**
 * The name of the widest breakpoint the viewport matches.
 *
 * Read through the service, which answers honestly **without a subscriber** —
 * asking a `MediaQueryList` is a read. So a page whose components only ever
 * read their responsive options keeps no `matchMedia` listener alive: the
 * listeners belong to the subscription below, and to nothing else.
 */
export function activeBreakpoint(): string {
  return useBreakpoint().props().name;
}

/**
 * Whether an attribute name is this option's, at any breakpoint.
 */
export function isResponsiveAttribute(attribute: string, name: string): boolean {
  return name === attribute || name.startsWith(`${attribute}${RESPONSIVE_SEPARATOR}`);
}

/**
 * The raw value in force for one option at one breakpoint.
 *
 * Walks from the active breakpoint down to the narrowest and falls back to the
 * unsuffixed attribute — the cascade, expressed as a search from the most
 * specific match. `get` is the source of the attribute values: the element for
 * the current state, or a batch's pre-mutation values for what it used to be.
 *
 * An empty breakpoint name — a viewport below every breakpoint in the set —
 * has no scoped candidate, so the base attribute answers on its own.
 */
export function responsiveRawValue(
  attribute: string,
  breakpoint: string,
  get: (name: string) => string | null,
): string | null {
  return responsiveScopedRawValue(attribute, breakpoint, get) ?? get(attribute);
}

/**
 * The scoped value in force at one breakpoint, without falling back to the
 * plain attribute. An empty string is a present override; `null` means no
 * scoped candidate was present.
 *
 * @internal
 */
export function responsiveScopedRawValue(
  attribute: string,
  breakpoint: string,
  get: (name: string) => string | null,
): string | null {
  const names = breakpointNames();
  const scoped = scopedAttributes(attribute);
  for (let index = names.indexOf(breakpoint); index >= 0; index -= 1) {
    const value = get(scoped[index]);
    if (value !== null) {
      return value;
    }
  }
  return null;
}

/**
 * Follow the viewport, and report the breakpoint it left as well as the one it
 * reached.
 *
 * The subscription is the only thing here that costs anything at rest. Option
 * effects open it per mount cycle; the registry opens one shared subscription
 * while connected responsive declarations exist. Reference counting does the
 * rest: the breakpoint service holds its `matchMedia` listeners while it has
 * subscribers and releases them with the last one.
 */
export function watchBreakpoint(callback: (previous: string) => void): () => void {
  let previous = activeBreakpoint();
  return useBreakpoint().subscribe(({ name }) => {
    const left = previous;
    previous = name;
    callback(left);
  });
}

/**
 * Report a breakpoint-scoped attribute whose suffix names no breakpoint.
 *
 * A typo, or v3 markup: `data-option-mode:xxs:xs:s` parses as the single
 * breakpoint `xxs:xs:s`, which is in no set, so the attribute is simply never a
 * candidate and the option quietly serves its base value everywhere. That is
 * the one failure this design can produce silently, and a migration is exactly
 * when it happens — so it is said out loud, once per element and spelling, in
 * the same spirit as the payload-shape warning: the option still resolves,
 * this reports a spelling rather than policing one.
 *
 * The element's attributes are scanned **once** for all of a component's
 * options rather than once per option, since `getAttributeNames()` allocates.
 */
const warnedResponsiveAttributes = new WeakMap<Element, Set<string>>();

export function checkResponsiveAttributes(el: HTMLElement, attributes: readonly string[]): void {
  if (attributes.length === 0) {
    return;
  }
  const names = breakpointNames();
  for (const name of el.getAttributeNames()) {
    for (const attribute of attributes) {
      const prefix = `${attribute}${RESPONSIVE_SEPARATOR}`;
      if (name.startsWith(prefix) && !names.includes(name.slice(prefix.length))) {
        let warned = warnedResponsiveAttributes.get(el);
        if (warned?.has(name)) {
          break;
        }
        if (!warned) {
          warned = new Set();
          warnedResponsiveAttributes.set(el, warned);
        }
        warned.add(name);
        console.warn(
          `[base] \`${name}\` names no breakpoint, so it is never read. One breakpoint per attribute, cascading upwards from it — known names: ${names.join(', ')}.`,
        );
        break;
      }
    }
  }
}
