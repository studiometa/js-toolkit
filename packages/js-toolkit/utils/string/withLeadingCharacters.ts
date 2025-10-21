import { withoutLeadingCharacters } from './withoutLeadingCharacters.js';

/**
 * Add the given characters to the start of the given string.
 *
 * @param  {string} string     The string to modify.
 * @param  {string} characters The characters to add to the start.
 * @return {string}
 * @link https://js-toolkit.studiometa.dev/utils/string/withLeadingCharacters.html
*/
export function withLeadingCharacters(string: string, characters: string): string {
  return `${characters}${withoutLeadingCharacters(string, characters)}`;
}
