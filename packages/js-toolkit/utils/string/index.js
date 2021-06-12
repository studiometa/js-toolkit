/**
 * Remove the given characters from the end of the given string.
 *
 * @param {string} string     The string to modify.
 * @param {string} characters The characters to remove from the end.
 */
export function withoutTrailingCharacters(string, characters) {
  return string.replace(new RegExp(`${characters}$`), '');
}

/**
 * Add the given characters to the end of the given string.
 *
 * @param {string} string     The string to modify.
 * @param {string} characters The characters to add to the end.
 */
export function withTrailingCharacters(string, characters) {
  return `${withoutTrailingCharacters(string, characters)}${characters}`;
}

/**
 * Remove the trailing slash from a string.
 *
 * @param {string} string The string to modify.
 * @return {string} The string without trailing slash.
 */
export function withoutTrailingSlash(string) {
  return withoutTrailingCharacters(string, '/');
}

/**
 * Add a trailing slash to a string.
 *
 * @param {string} string The string to modify.
 * @return {string} The string with a trailing slash.
 */
export function withTrailingSlash(string) {
  return withTrailingCharacters(string, '/');
}
