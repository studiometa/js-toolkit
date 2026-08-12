/**
 * String shapes the framework converts between: an option or handler name in
 * source, and the `data-` attribute or event type it corresponds to.
 */

const REGEX_KEBAB = /([a-z0-9])([A-Z])/g;

/**
 * Convert `PascalCase`/`camelCase` to `kebab-case`.
 */
export function kebabCase(string: string): string {
  return string.replace(REGEX_KEBAB, '$1-$2').toLowerCase();
}

/**
 * Capitalize the first letter: a `data-ref="btn"` name becomes the `Btn` of
 * an `onBtnClick` handler.
 */
export function pascalCase(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
