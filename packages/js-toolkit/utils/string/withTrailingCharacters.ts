import { withoutTrailingCharacters } from './withoutTrailingCharacters.js';

/**
 * Add the given characters to the end of the given string.
 *
 * @param  {string} string     The string to modify.
 * @param  {string} characters The characters to add to the end.
 * @return {string}
 * @link https://js-toolkit.studiometa.dev/utils/string/withTrailingCharacters.html
*/
export function withTrailingCharacters(string: string, characters: string): string {
  return `${withoutTrailingCharacters(string, characters)}${characters}`;
}
