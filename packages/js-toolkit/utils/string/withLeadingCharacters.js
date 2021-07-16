import withoutLeadingCharacters from './withoutLeadingCharacters.js';

/**
 * Add the given characters to the start of the given string.
 *
 * @param {string} string     The string to modify.
 * @param {string} characters The characters to add to the start.
 */
export default function withLeadingCharacters(string, characters) {
  return `${characters}${withoutLeadingCharacters(string, characters)}`;
}
