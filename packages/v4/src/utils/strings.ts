/**
 * String shapes the framework converts between: an option or handler name in
 * source, and the `data-` attribute or event type it corresponds to.
 */

import { memo } from './memo.js';

const SPLIT_LOWER_UPPER_RE = /([\p{Ll}\d])(\p{Lu})/gu;
const SPLIT_UPPER_UPPER_RE = /(\p{Lu})([\p{Lu}][\p{Ll}])/gu;
const STRIP_RE = /[^\p{L}\d]+/giu;
const SPLIT_REPLACE_VALUE = '$1\0$2';

/**
 * Split a string into words, on case boundaries and on anything which is
 * neither a letter nor a digit.
 *
 * @link https://github.com/blakeembrey/change-case
 */
function split(value: string): string[] {
  let result = value
    .trim()
    .replace(SPLIT_LOWER_UPPER_RE, SPLIT_REPLACE_VALUE)
    .replace(SPLIT_UPPER_UPPER_RE, SPLIT_REPLACE_VALUE)
    .replace(STRIP_RE, '\0');

  let start = 0;
  let end = result.length;

  // Trim the delimiter from around the output.
  while (result.charAt(start) === '\0') start++;
  if (start === end) return [];
  while (result.charAt(end - 1) === '\0') end--;

  return result.slice(start, end).split('\0');
}

/** Join the words of a string in lowercase, with the given delimiter. */
function delimitedCase(string: string, delimiter: string): string {
  return split(string).map(lowerCase).join(delimiter);
}

/**
 * Convert a string to lowercase.
 * @link https://js-toolkit-v4.studiometa.dev/utils/strings.html#lowercase
 */
export function lowerCase(string: string): string {
  return string.toLowerCase();
}

/**
 * Convert a string to UPPERCASE.
 * @link https://js-toolkit-v4.studiometa.dev/utils/strings.html#uppercase
 */
export function upperCase(string: string): string {
  return string.toUpperCase();
}

/**
 * Capitalize the first character and leave the rest alone: a `data-ref="btn"`
 * name becomes the `Btn` of an `onBtnClick` handler.
 *
 * This is not {@link pascalCase} — it never splits words, so it round-trips a
 * name the framework read from source.
 * @link https://js-toolkit-v4.studiometa.dev/utils/strings.html#capitalize
 */
export function capitalize(string: string): string {
  return upperCase(string.charAt(0)) + string.slice(1);
}

/**
 * Convert a string to `PascalCase`.
 * @link https://js-toolkit-v4.studiometa.dev/utils/strings.html#pascalcase
 */
export const pascalCase = /* @__PURE__ */ memo(function pascalCase(string: string): string {
  return split(string)
    .map((word) => upperCase(word.charAt(0)) + lowerCase(word.slice(1)))
    .join('');
});

/**
 * Convert a string to `camelCase`.
 * @link https://js-toolkit-v4.studiometa.dev/utils/strings.html#camelcase
 */
export const camelCase = /* @__PURE__ */ memo(function camelCase(string: string): string {
  const result = pascalCase(string);
  return lowerCase(result.charAt(0)) + result.slice(1);
});

/**
 * Convert a string to `kebab-case`, the shape of a `data-` attribute.
 * @link https://js-toolkit-v4.studiometa.dev/utils/strings.html#kebabcase
 */
export const kebabCase = /* @__PURE__ */ memo(function kebabCase(string: string): string {
  return delimitedCase(string, '-');
});

/**
 * Convert a string to `snake_case`.
 * @link https://js-toolkit-v4.studiometa.dev/utils/strings.html#snakecase
 */
export const snakeCase = /* @__PURE__ */ memo(function snakeCase(string: string): string {
  return delimitedCase(string, '_');
});
/**
 * Add the given characters to the start of a string, once.
 * @link https://js-toolkit-v4.studiometa.dev/utils/strings.html#withleadingcharacters
 */
export function withLeadingCharacters(string: string, characters: string): string {
  return `${characters}${withoutLeadingCharacters(string, characters)}`;
}

/**
 * Remove the given characters from the start of a string, once.
 *
 * No characters is nothing to remove: every helper here returns the string
 * unchanged rather than treating the empty match every string starts and ends
 * with as a hit.
 * @link https://js-toolkit-v4.studiometa.dev/utils/strings.html#withoutleadingcharacters
 */
export function withoutLeadingCharacters(string: string, characters: string): string {
  if (characters.length === 0) {
    return string;
  }
  return string.startsWith(characters) ? string.slice(characters.length) : string;
}

/**
 * Remove the given characters from the start of a string, as often as they repeat.
 * @link https://js-toolkit-v4.studiometa.dev/utils/strings.html#withoutleadingcharactersrecursive
 */
export function withoutLeadingCharactersRecursive(string: string, characters: string): string {
  if (characters.length === 0) {
    return string;
  }
  let result = string;
  while (result.startsWith(characters)) {
    result = result.slice(characters.length);
  }
  return result;
}

/**
 * Add the given characters to the end of a string, once.
 * @link https://js-toolkit-v4.studiometa.dev/utils/strings.html#withtrailingcharacters
 */
export function withTrailingCharacters(string: string, characters: string): string {
  return `${withoutTrailingCharacters(string, characters)}${characters}`;
}

/**
 * Remove the given characters from the end of a string, once.
 * @link https://js-toolkit-v4.studiometa.dev/utils/strings.html#withouttrailingcharacters
 */
export function withoutTrailingCharacters(string: string, characters: string): string {
  if (characters.length === 0) {
    return string;
  }
  return string.endsWith(characters) ? string.slice(0, -characters.length) : string;
}

/**
 * Remove the given characters from the end of a string, as often as they repeat.
 * @link https://js-toolkit-v4.studiometa.dev/utils/strings.html#withouttrailingcharactersrecursive
 */
export function withoutTrailingCharactersRecursive(string: string, characters: string): string {
  if (characters.length === 0) {
    return string;
  }
  let result = string;
  while (result.endsWith(characters)) {
    result = result.slice(0, -characters.length);
  }
  return result;
}

/**
 * Add a leading slash to a string, once.
 * @link https://js-toolkit-v4.studiometa.dev/utils/strings.html#withleadingslash
 */
export function withLeadingSlash(string: string): string {
  return withLeadingCharacters(string, '/');
}

/**
 * Remove the leading slash from a string, once.
 * @link https://js-toolkit-v4.studiometa.dev/utils/strings.html#withoutleadingslash
 */
export function withoutLeadingSlash(string: string): string {
  return withoutLeadingCharacters(string, '/');
}

/**
 * Add a trailing slash to a string, once.
 * @link https://js-toolkit-v4.studiometa.dev/utils/strings.html#withtrailingslash
 */
export function withTrailingSlash(string: string): string {
  return withTrailingCharacters(string, '/');
}

/**
 * Remove the trailing slash from a string, once.
 * @link https://js-toolkit-v4.studiometa.dev/utils/strings.html#withouttrailingslash
 */
export function withoutTrailingSlash(string: string): string {
  return withoutTrailingCharacters(string, '/');
}
