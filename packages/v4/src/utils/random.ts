/** Random values, in the ranges a component describes. */

/** A random number between the two bounds, the second defaulting to `0`. */
export function random(a: number, b = 0): number {
  return Math.random() * (b - a) + a;
}

/**
 * A random integer between the two bounds, both included and the second
 * defaulting to `0`.
 *
 * Every integer in the range is equally likely. Rounding a random float
 * instead — which is what v3 did — gives the two bounds half a chance each.
 */
export function randomInt(a: number, b = 0): number {
  const min = Math.ceil(Math.min(a, b));
  const max = Math.floor(Math.max(a, b));
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** A random item of an array, or a random character of a string. */
export function randomItem<T>(items: readonly T[]): T | undefined;
export function randomItem(items: string): string | undefined;
export function randomItem<T>(items: readonly T[] | string): T | string | undefined {
  return items.length > 0 ? items[randomInt(0, items.length - 1)] : undefined;
}
