import { withLeadingCharacters } from './withLeadingCharacters.js';

/**
 * Add a leading slash to a string.
 *
 * @param {string} string The string to modify.
 * @return {string} The string with a leading slash.
 * @link https://js-toolkit.studiometa.dev/utils/string/withLeadingSlash.html
*/
export function withLeadingSlash(string: string): string {
  return withLeadingCharacters(string, '/');
}
