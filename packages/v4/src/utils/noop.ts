/** Placeholders for an optional callback, so a caller never branches on one. */

/**
 * Do nothing, whatever it is called with.
 * @link https://js-toolkit-v4.studiometa.dev/utils/timing.html#noop
 */
export function noop(): void {}

/**
 * Return the value unaltered: the identity of a transform chain.
 * @link https://js-toolkit-v4.studiometa.dev/utils/timing.html#noopvalue
 */
export function noopValue<T>(value: T): T {
  return value;
}
