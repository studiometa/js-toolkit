/**
 * Test if a string starts with another string.
 *
 * This is a more performant version of the `String.prototype.endsWith` method.
 *
 * @see https://jsbench.me/1hlkqqd0ff/2
 */
export function endsWith(str: string, search: string): boolean {
  const { length } = search;

  if (length === 0) {
    return true;
  }

  if (length === 1) {
    // eslint-disable-next-line unicorn/prefer-at
    return str[str.length - 1] === search;
  }

  // eslint-disable-next-line unicorn/prefer-string-slice
  return str.substring(str.length - search.length) === search;
}
