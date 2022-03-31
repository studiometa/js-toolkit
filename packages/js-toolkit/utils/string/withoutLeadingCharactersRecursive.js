import withoutLeadingCharacters from './withoutLeadingCharacters.js';

/**
 * Remove the given characters to the start of the given string recursively.
 *
 * @param   {string} string     The string to modify.
 * @param   {string} characters The characters to add to the start.
 * @returns {string}
 */
export default function withoutLeadingCharactersRecursive(string, characters) {
  let str = withoutLeadingCharacters(string, characters);
  const regex = new RegExp(`^${characters}`);

  while (regex.test(str)) {
    str = withoutLeadingCharacters(str, characters);
  }

  return str;
}
