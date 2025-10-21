import { withoutTrailingCharacters } from './withoutTrailingCharacters.js';

/**
 * Remove the trailing slash from a string.
 *
 * @param {string} string The string to modify.
 * @return {string} The string without trailing slash.
 * @link https://js-toolkit.studiometa.dev/utils/string/withoutTrailingSlash.html
*/
export function withoutTrailingSlash(string: string): string {
  return withoutTrailingCharacters(string, '/');
}
