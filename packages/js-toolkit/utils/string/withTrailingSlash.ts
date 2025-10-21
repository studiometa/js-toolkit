import { withTrailingCharacters } from './withTrailingCharacters.js';

/**
 * Add a trailing slash to a string.
 *
 * @param {string} string The string to modify.
 * @return {string} The string with a trailing slash.
 * @link https://js-toolkit.studiometa.dev/utils/string/withTrailingSlash.html
*/
export function withTrailingSlash(string: string): string {
  return withTrailingCharacters(string, '/');
}
