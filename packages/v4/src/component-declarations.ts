import {
  activeBreakpoint,
  responsiveAttributeNames,
  responsiveScopedRawValue,
  RESPONSIVE_SEPARATOR,
} from './responsive-options.js';

export const COMPONENT_ATTRIBUTE = 'data-component';

/** Parse the whitespace-token syntax used by every component declaration. */
function tokens(value: string | null): string[] {
  return (value ?? '').split(/\s+/).filter(Boolean);
}

/**
 * The component names currently declared on an element.
 *
 * The plain attribute is unconditional. One scoped value is selected by the
 * responsive cascade and replaces every lower scoped value. The two sets are
 * then combined and deduplicated here, before the registry sees them.
 */
export function componentTokens(el: Element): Set<string> {
  const get = (attribute: string) => el.getAttribute(attribute);
  const scoped = responsiveScopedRawValue(COMPONENT_ATTRIBUTE, activeBreakpoint(), get);
  return new Set([...tokens(get(COMPONENT_ATTRIBUTE)), ...tokens(scoped)]);
}

/** Whether an element carries any component spelling, including an invalid suffix. */
export function hasComponentAttribute(el: Element): boolean {
  const prefix = `${COMPONENT_ATTRIBUTE}${RESPONSIVE_SEPARATOR}`;
  return el
    .getAttributeNames()
    .some((attribute) => attribute === COMPONENT_ATTRIBUTE || attribute.startsWith(prefix));
}

/** Whether an element carries a scoped spelling from the configured breakpoint set. */
export function hasResponsiveComponentAttribute(el: Element): boolean {
  return responsiveAttributeNames(COMPONENT_ATTRIBUTE).some((attribute) =>
    el.hasAttribute(attribute),
  );
}
