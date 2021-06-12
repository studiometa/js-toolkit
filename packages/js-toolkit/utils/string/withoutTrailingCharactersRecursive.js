import withoutTrailingCharacters from './withoutTrailingCharacters.js';

/**
 * Remove the given characters to the start of the given string recursively.
 *
 * @param {string} string     The string to modify.
 * @param {string} characters The characters to add to the start.
 */
export default function withoutTrailingCharactersRecursive(string, characters) {
  let str = withoutTrailingCharacters(string, characters);
  const regex = new RegExp(`${characters}$`);

  while (regex.test(str)) {
    str = withoutTrailingCharacters(str, characters);
  }

  return str;
}
