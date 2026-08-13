/**
 * Responsive options — one option, several values, chosen by the viewport.
 *
 * An option declares itself responsive in the config, and its markup gains
 * breakpoint-scoped spellings of the same attribute:
 *
 *     options: { columns: { type: Number, default: 1, responsive: true } }
 *
 *     <div data-component="Grid"
 *          data-option-columns="1"
 *          data-option-columns:s="2"
 *          data-option-columns:l="4"></div>
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
import { registerDOMOptionAttributes } from './dom-mutations.js';
import { breakpointNames, onBreakpointsReplaced, useBreakpoint } from './services/breakpoint.js';

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
 * a responsive option: composing the strings each time would allocate one per
 * candidate per access. Dropped when the set is replaced, below.
 */
const scopedNames = new Map<string, readonly string[]>();

/** Base attributes whose scoped spellings the one observer filters for. */
const observed = new Set<string>();

onBreakpointsReplaced(() => {
  scopedNames.clear();
  // The filter takes exact names, so a replaced set means names that were
  // never registered. Re-derive them, or a `data-option-x:<new>` rewritten at
  // runtime would be invisible while the plain `data-option-x` is honoured.
  for (const attribute of observed) {
    registerDOMOptionAttributes(scopedAttributes(attribute));
  }
});

function scopedAttributes(attribute: string): readonly string[] {
  let scoped = scopedNames.get(attribute);
  if (!scoped) {
    scoped = breakpointNames().map((name) => `${attribute}${RESPONSIVE_SEPARATOR}${name}`);
    scopedNames.set(attribute, scoped);
  }
  return scoped;
}

/**
 * Widen the one mutation observer's filter to an attribute's breakpoint-scoped
 * spellings, so rewriting `data-option-columns:s` at runtime reports a change
 * exactly as rewriting `data-option-columns` does.
 *
 * Called by the registry for every responsive option a registered component
 * declares.
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
  const names = breakpointNames();
  const scoped = scopedAttributes(attribute);
  for (let index = names.indexOf(breakpoint); index >= 0; index -= 1) {
    const value = get(scoped[index]);
    if (value !== null) {
      return value;
    }
  }
  return get(attribute);
}

/**
 * Follow the viewport, and report the breakpoint it left as well as the one it
 * reached.
 *
 * The subscription is the only thing here that costs anything at rest, which is
 * why the caller opens it per mount cycle and only for a component that can act
 * on a crossing. Reference counting does the rest: the breakpoint service holds
 * its `matchMedia` listeners while it has subscribers and releases them with
 * the last one, so a page with no responsive option — or one whose responsive
 * components have all been destroyed — listens to nothing.
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
 * when it happens — so it is said out loud, once per mount, in the same spirit
 * as the payload-shape warning: the option still resolves, this reports a
 * spelling rather than policing one.
 */
export function checkResponsiveAttributes(el: HTMLElement, attribute: string): void {
  const prefix = `${attribute}${RESPONSIVE_SEPARATOR}`;
  const names = breakpointNames();
  for (const name of el.getAttributeNames()) {
    if (name.startsWith(prefix) && !names.includes(name.slice(prefix.length))) {
      console.warn(
        `[base] \`${name}\` names no breakpoint, so it is never read. One breakpoint per attribute, cascading upwards from it — known names: ${names.join(', ')}.`,
      );
    }
  }
}
