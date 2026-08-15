import { COMPONENT_ATTRIBUTE } from '../component-declarations.js';
import { responsiveAttributeNames } from '../responsive-options.js';

/**
 * How a component name becomes a selector. One function, kept apart from the
 * string helpers because it encodes the attribute contract rather than a
 * spelling: `data-component` and its configured responsive spellings are
 * where the registry looks, and `~=` is why more than one component can be
 * declared on an element.
 */

/**
 * The registry selector for a component name.
 *
 * `~=` gives whitespace-token matching, so `data-component="Action Dialog"`
 * declares several components on one element. Scoped attributes are included
 * as discovery candidates; callers still check for a mounted instance, so an
 * inactive declaration never appears in a lookup result.
 */
export function selectorFor(name: string): string {
  return [COMPONENT_ATTRIBUTE, ...responsiveAttributeNames(COMPONENT_ATTRIBUTE)]
    .map((attribute) => `[${CSS.escape(attribute)}~="${name}"]`)
    .join(',');
}
