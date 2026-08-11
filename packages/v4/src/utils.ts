const REGEX_KEBAB = /([a-z0-9])([A-Z])/g;

/**
 * Convert `PascalCase`/`camelCase` to `kebab-case`.
 */
export function kebabCase(string: string): string {
  return string.replace(REGEX_KEBAB, '$1-$2').toLowerCase();
}

/**
 * The registry selector for a component name.
 * `~=` gives whitespace-token matching, so `data-component="Action Dialog"`
 * declares several components on one element.
 */
export function selectorFor(name: string): string {
  return `[data-component~="${name}"]`;
}
