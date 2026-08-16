import { COMPONENT_ATTRIBUTE } from '../attributes.js';
import { responsiveAttributeNames } from '../responsive-options.js';

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
