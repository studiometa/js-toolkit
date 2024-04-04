import { isArray, isString } from './is.js';

/**
 * Get a random integer between bounds
 *
 * @param {number} a Lower bound
 * @param {number} b Upper bound
 * @returns {number}
 */
export function randomInt(a: number, b = 0): number {
  return Math.floor(Math.random() * (a - b + 1)) + b;
}

/**
 * Get a random item of an array or a random character of a string
 *
 * @param {T[] | string} items Array or string
 * @returns {T | undefined}
 */
export function randomItem<T>(items: T[] | string): T | string | undefined {
  if (!isArray(items) && !isString(items)) {
    throw new Error('randomItem() expects an array or a string as argument.');
  }
  return items.length > 0 ? items[randomInt(items.length - 1)] : undefined;
}
