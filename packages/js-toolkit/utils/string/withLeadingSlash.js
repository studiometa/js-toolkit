import withLeadingCharacters from './withLeadingCharacters.js';

/**
 * Add a leading slash to a string.
 *
 * @param {string} string The string to modify.
 * @return {string} The string with a leading slash.
 */
export default function withLeadingSlash(string) {
  return withLeadingCharacters(string, '/');
}
