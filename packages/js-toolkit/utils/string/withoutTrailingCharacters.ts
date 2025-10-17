/**
 * Remove the given characters from the end of the given string.
 *
 * @param  {string} string     The string to modify.
 * @param  {string} characters The characters to remove from the end.
 * @return {string}
 * @link https://js-toolkit.studiometa.dev/utils/string/withoutTrailingCharacters.html
*/
export function withoutTrailingCharacters(string: string, characters: string): string {
  return string.replace(new RegExp(`${characters}$`), '');
}
