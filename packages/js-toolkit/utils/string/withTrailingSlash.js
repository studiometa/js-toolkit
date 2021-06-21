import withTrailingCharacters from './withTrailingCharacters.js';

/**
 * Add a trailing slash to a string.
 *
 * @param {string} string The string to modify.
 * @return {string} The string with a trailing slash.
 */
export default function withTrailingSlash(string) {
  return withTrailingCharacters(string, '/');
}
