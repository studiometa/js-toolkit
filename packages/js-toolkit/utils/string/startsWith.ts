/**
 * Test if a string starts with another string.
 *
 * This is a more performant version of the `String.prototype.startsWith` method.
 *
 * @see https://jsbench.me/1hlkqqd0ff/1
 */
export function startsWith(string: string, search: string): boolean {
  if (search.length === 0) {
    return true;
  }

  if (search.length === 1) {
    return string[0] === search;
  }

  // eslint-disable-next-line unicorn/prefer-string-slice
  return string.substring(0, search.length) === search;
}
