import withoutTrailingCharacters from './withoutTrailingCharacters.js';

/**
 * Add the given characters to the end of the given string.
 *
 * @param   {string} string     The string to modify.
 * @param   {string} characters The characters to add to the end.
 * @returns {string}
 */
export default function withTrailingCharacters(string, characters) {
  return `${withoutTrailingCharacters(string, characters)}${characters}`;
}
