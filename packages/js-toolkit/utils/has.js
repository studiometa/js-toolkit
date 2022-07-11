/**
 * Test if the current context as a global `window` object available.
 *
 * @returns {boolean}
 */
export function hasWindow() {
  return typeof window !== 'undefined';
}
