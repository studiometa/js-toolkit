/**
 * Responsive options cascade from the active breakpoint through narrower breakpoints to the unsuffixed base value.
 *
 * Values are resolved on read and are not stored.
 */
import { warnOnce } from './diagnostics.js';
import { registerDOMOptionAttributes, replaceDOMOptionAttributes } from './dom-mutations.js';
import { breakpointNames, onBreakpointsReplaced, useBreakpoint } from './services/breakpoint.js';
import { getSharedRuntimeSlot } from './shared-runtime.js';
import { memo, type Memo } from './utils/memo.js';

/** Separates an option attribute from its breakpoint without conflicting with kebab-case names. */
export const RESPONSIVE_SEPARATOR = ':';

/** Memoized scoped attribute names for the current breakpoint set. */
interface ResponsiveOptionsRuntimeState {
  scopedAttributes: Memo<[attribute: string], readonly string[]>;
  observed: Set<string>;
  isReplacementListenerAttached: boolean;
}

const responsiveOptionsState = /* @__PURE__ */ getSharedRuntimeSlot<ResponsiveOptionsRuntimeState>(
  'responsive-options',
  2,
  () => ({
    scopedAttributes: memo((attribute: string): readonly string[] =>
      breakpointNames().map((name) => `${attribute}${RESPONSIVE_SEPARATOR}${name}`),
    ),
    observed: new Set(),
    isReplacementListenerAttached: false,
  }),
);
const { scopedAttributes, observed } = responsiveOptionsState;

/**
 * Exact scoped spellings used by declaration cascades and observer filters.
 * @internal
 */
export function responsiveAttributeNames(attribute: string): readonly string[] {
  return scopedAttributes(attribute);
}

/** Base attributes whose scoped spellings the one observer filters for. */
if (!responsiveOptionsState.isReplacementListenerAttached) {
  responsiveOptionsState.isReplacementListenerAttached = true;
  onBreakpointsReplaced(() => {
    const previous = [...observed].flatMap((attribute) => scopedAttributes(attribute));
    scopedAttributes.clear();
    // Replace exact observer filter names when the breakpoint set changes.
    const next = [...observed].flatMap((attribute) => scopedAttributes(attribute));
    replaceDOMOptionAttributes(previous, next);
  });
}

/** Add an attribute's breakpoint-scoped names to the mutation observer filter. */
export function observeResponsiveAttribute(attribute: string): void {
  observed.add(attribute);
  registerDOMOptionAttributes(scopedAttributes(attribute));
}

/** Return the widest matching breakpoint without creating a subscription. */
export function activeBreakpoint(): string {
  return useBreakpoint().props().name;
}

/** Whether an attribute name belongs to this option at any breakpoint. */
export function isResponsiveAttribute(attribute: string, name: string): boolean {
  return name === attribute || name.startsWith(`${attribute}${RESPONSIVE_SEPARATOR}`);
}

/** Resolve a raw option value by cascading from a breakpoint to the base attribute. */
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

/** Watch breakpoint changes and pass the previous breakpoint to the callback. */
export function watchBreakpoint(callback: (previous: string) => void): () => void {
  let previous = activeBreakpoint();
  return useBreakpoint().subscribe(({ name }) => {
    const left = previous;
    previous = name;
    callback(left);
  });
}

/** Warn once for each responsive attribute suffix that names no breakpoint. */
export function checkResponsiveAttributes(el: HTMLElement, attributes: readonly string[]): void {
  if (attributes.length === 0) {
    return;
  }
  const names = breakpointNames();
  for (const name of el.getAttributeNames()) {
    for (const attribute of attributes) {
      const prefix = `${attribute}${RESPONSIVE_SEPARATOR}`;
      if (name.startsWith(prefix) && !names.includes(name.slice(prefix.length))) {
        warnOnce(
          el,
          name,
          'responsive.unknown-breakpoint',
          `\`${name}\` names no breakpoint, so it is never read. One breakpoint per attribute, cascading upwards from it — known names: ${names.join(', ')}.`,
          { target: el },
        );
        break;
      }
    }
  }
}
