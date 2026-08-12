let count = 0;

/**
 * A unique, stable id for an instance.
 *
 * v3's `Base` gives every instance a `$id` (`<Name>-<random>`), which the
 * ARIA wiring of `AccordionItem` and the `aria-label` of `SliderItem` both
 * rely on. v4's `Base` has no such property, so components that need one
 * mint it themselves.
 */
export function uid(prefix: string): string {
  count += 1;
  return `${prefix}-${count}`;
}
