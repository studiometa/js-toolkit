/** Placeholders for an optional callback, so a caller never branches on one. */

/** Do nothing, whatever it is called with. */
export function noop(): void {}

/** Return the value unaltered: the identity of a transform chain. */
export function noopValue<T>(value: T): T {
  return value;
}
