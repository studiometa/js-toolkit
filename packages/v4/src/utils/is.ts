/** Type guards for the values a component reads from the DOM or its options. */

/** Whether a value is `null`. */
export function isNull(value: unknown): value is null {
  return value === null;
}

/** Whether a value is anything but `undefined`. */
export function isDefined<T>(value: T | undefined): value is T {
  return typeof value !== 'undefined';
}

/** Whether a value is a string. */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/** Whether a value is a number, `NaN` excluded. */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/** Whether a value is a boolean. */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/** Whether a value is callable. */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

/**
 * Whether a value is a plain object: an array, a `Date`, a DOM node and `null`
 * are all excluded.
 *
 * The tag is read through `Object.prototype`, so an object with no prototype
 * answers instead of throwing on a missing `toString`.
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}
