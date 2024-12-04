import { withoutLeadingCharacters } from './withoutLeadingCharacters.js';

/**
 * Remove the leading slash from a string.
 *
 * @param {string} string The string to modify.
 * @returns {string} The string without leading slash.
 */
export function withoutLeadingSlash(string: string): string {
  return withoutLeadingCharacters(string, '/');
}
