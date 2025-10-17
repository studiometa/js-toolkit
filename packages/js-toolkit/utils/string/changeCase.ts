import { memo } from '../memo.js';

const SPLIT_LOWER_UPPER_RE = /([\p{Ll}\d])(\p{Lu})/gu;
const SPLIT_UPPER_UPPER_RE = /(\p{Lu})([\p{Lu}][\p{Ll}])/gu;
const DEFAULT_STRIP_REGEXP = /[^\p{L}\d]+/giu;
const SPLIT_REPLACE_VALUE = '$1\0$2';

/**
 * Split function from the `change-case` package.
 * @link https://github.com/blakeembrey/change-case
 */
function split(value: string) {
  let result = value.trim();

  result = result
    .replace(SPLIT_LOWER_UPPER_RE, SPLIT_REPLACE_VALUE)
    .replace(SPLIT_UPPER_UPPER_RE, SPLIT_REPLACE_VALUE);

  result = result.replace(DEFAULT_STRIP_REGEXP, '\0');

  let start = 0;
  let end = result.length;

  // Trim the delimiter from around the output string.
  while (result.charAt(start) === '\0') start++;
  if (start === end) return [];
  while (result.charAt(end - 1) === '\0') end--;

  return result.slice(start, end).split(/\0/g);
}

/**
 * Convert a string to lowercase and join each word with the given delimiter.
 */
function delimitedCase(string: string, delimiter: string): string {
  return split(string)
    .map((word) => lowerCase(word))
    .join(delimiter);
}
/**
 * Convert a string to lowercase.
 * @link https://js-toolkit.studiometa.dev/utils/string/lowerCase.html
*/
export function lowerCase(string: string): string {
  return string.toLowerCase();
}

/**
 * Convert a string to UPPERCASE.
 * @link https://js-toolkit.studiometa.dev/utils/string/upperCase.html
*/
export function upperCase(string: string): string {
  return string.toUpperCase();
}

/**
 * Convert a string to camelCase.
 * @link https://js-toolkit.studiometa.dev/utils/string/camelCase.html
*/
export const camelCase = memo(function camelCase(string: string): string {
  const result = pascalCase(string);
  return lowerCase(result[0]) + result.slice(1);
});

/**
 * Convert a string to PascalCase.
 * @link https://js-toolkit.studiometa.dev/utils/string/pascalCase.html
*/
export const pascalCase = memo(function pascalCase(string: string): string {
  return split(string)
    .map((word) => upperCase(word[0]) + lowerCase(word.slice(1)))
    .join('');
});

/**
 * Convert a string to snake_case.
 * @link https://js-toolkit.studiometa.dev/utils/string/snakeCase.html
*/
export const snakeCase = memo(function snakeCase(string: string): string {
  return delimitedCase(string, '_');
});

/**
 * Convert a string to dash-case.
 * @link https://js-toolkit.studiometa.dev/utils/string/dashCase.html
*/
export const dashCase = memo(function dashCase(string: string): string {
  return delimitedCase(string, '-');
});
