import withoutTrailingCharacters from './withoutTrailingCharacters.js';

/**
 * Remove the trailing slash from a string.
 *
 * @param {string} string The string to modify.
 * @returns {string} The string without trailing slash.
 */
export default function withoutTrailingSlash(string) {
  return withoutTrailingCharacters(string, '/');
}
