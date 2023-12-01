/**
 * Test if a string starts with another string.
 *
 * This is a more performant version of the `String.prototype.endsWith` method.
 *
 * @see https://jsbench.me/1hlkqqd0ff/2
 */
export function endsWith(string: string, search: string): boolean {
  if (search.length === 0) {
    return true;
  }

  if (search.length === 1) {
    // eslint-disable-next-line unicorn/prefer-at
    return string[string.length - 1] === search;
  }

  // eslint-disable-next-line unicorn/prefer-string-slice
  return string.substring(string.length - search.length) === search;
}
