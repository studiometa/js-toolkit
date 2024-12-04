import { withLeadingCharacters } from './withLeadingCharacters.js';

/**
 * Add a leading slash to a string.
 *
 * @param {string} string The string to modify.
 * @returns {string} The string with a leading slash.
 */
export function withLeadingSlash(string: string): string {
  return withLeadingCharacters(string, '/');
}
