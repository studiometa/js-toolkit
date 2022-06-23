/**
 * No operation function.
 * @returns {void}
 */
export function noop() {}

/**
 * No operation function which return the given value unaltered.
 * @template {any} T
 * @param   {T} value
 * @returns {T}
 */
export function noopValue(value) {
  return value;
}
