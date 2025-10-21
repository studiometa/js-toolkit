import { withoutLeadingCharacters } from './withoutLeadingCharacters.js';

/**
 * Remove the leading slash from a string.
 *
 * @param {string} string The string to modify.
 * @return {string} The string without leading slash.
 * @link https://js-toolkit.studiometa.dev/utils/string/withoutLeadingSlash.html
*/
export function withoutLeadingSlash(string: string): string {
  return withoutLeadingCharacters(string, '/');
}
