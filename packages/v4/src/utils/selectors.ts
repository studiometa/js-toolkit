/**
 * How a component name becomes a selector. One function, kept apart from the
 * string helpers because it encodes the attribute contract rather than a
 * spelling: `data-component` is where the registry looks, and `~=` is why more
 * than one component can be declared on an element.
 */

/**
 * The registry selector for a component name.
 *
 * `~=` gives whitespace-token matching, so `data-component="Action Dialog"`
 * declares several components on one element.
 */
export function selectorFor(name: string): string {
  return `[data-component~="${name}"]`;
}
