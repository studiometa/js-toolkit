/**
 * Test if a string starts with another string.
 *
 * This is a more performant version of the `String.prototype.startsWith` method.
 *
 * @see https://jsbench.me/1hlkqqd0ff/1
 */
export function startsWith(str: string, search: string): boolean {
  const { length } = search;

  if (length === 0) {
    return true;
  }

  if (length === 1) {
    return str[0] === search;
  }

  // eslint-disable-next-line unicorn/prefer-string-slice
  return str.substring(0, length) === search;
}
