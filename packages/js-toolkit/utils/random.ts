import { isArray, isString } from './is.js';

/**
 * Get a random number between given bounds.
 * @param  {number} a   First bound.
 * @param  {number} [b] Second bound, defaults to 0.
 * @return {number} A number between `a` and `b`.
 * @link https://js-toolkit.studiometa.dev/utils/random.html
*/
export function random(a: number, b = 0): number {
  return Math.random() * (b - a) + a;
}

/**
 * Get a random integer between bounds
 *
 * @param {number} a First bound.
 * @param {number} b Second bound.
 * @return {number} An integer between `a` and `b`;
 * @link https://js-toolkit.studiometa.dev/utils/randomInt.html
*/
export function randomInt(a: number, b = 0): number {
  return Math.round(random(a, b));
}

/**
 * Get a random item of an array or a random character of a string
 *
 * @param {T[] | string} items Array or string
 * @return {T | undefined}
 * @throws {Error} Throws an error if `items` is not an array or a string.
 * @link https://js-toolkit.studiometa.dev/utils/randomItem.html
*/
export function randomItem<T>(items: T[] | string): T | string | undefined {
  if (!isArray(items) && !isString(items)) {
    throw new Error('randomItem() expects an array or a string as argument.');
  }
  return items.length > 0 ? items[randomInt(items.length - 1)] : undefined;
}
