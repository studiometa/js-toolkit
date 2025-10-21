/**
 * No operation function.
 *
 * @return {void}
 */
export function noop() {}

/**
 * No operation function which return the given value unaltered.
 */
export function noopValue<T>(value: T): T {
  return value;
}
