import { COMPONENT_ATTRIBUTE } from '../attributes.js';
import { responsiveAttributeNames } from '../responsive-options.js';

/**
 * The registry selector for a component name.
 *
 * `~=` gives whitespace-token matching, so `data-component="Action Dialog"`
 * declares several components on one element. Scoped attributes are included
 * as discovery candidates, so this selector deliberately over-matches: an
 * element that declares a name only above a breakpoint matches it below one
 * too. The narrowing is the caller's read of the element's instance map, not
 * a mount check — an inactive declaration has no instance, because a
 * breakpoint-withdrawn component is destroyed and deleted from that map. Do
 * not re-add an `$isMounted` filter here or at a call site to "fix" the
 * over-matching: it would also hide every instance a reversible `in-view` or
 * `media:` strategy has legitimately stood down.
 */
export function selectorFor(name: string): string {
  return [COMPONENT_ATTRIBUTE, ...responsiveAttributeNames(COMPONENT_ATTRIBUTE)]
    .map((attribute) => `[${CSS.escape(attribute)}~="${name}"]`)
    .join(',');
}
