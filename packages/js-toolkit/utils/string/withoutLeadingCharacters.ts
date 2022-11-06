/**
 * Remove the given characters from the start of the given string.
 *
 * @param   {string} string     The string to modify.
 * @param   {string} characters The characters to remove from the start.
 * @returns {string}
 */
export default function withoutLeadingCharacters(string:string, characters:string):string {
  return string.replace(new RegExp(`^${characters}`), '');
}
