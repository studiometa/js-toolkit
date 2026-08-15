/**
 * The private key used by decorator initializers.
 *
 * `Symbol.for()` keeps its identity stable when two bundled package copies run
 * in one realm. The explicit annotation keeps its `unique symbol` type, so
 * computed properties remain precise at compile time.
 */
export const HANDLER_REGISTRATIONS: unique symbol = Symbol.for(
  '@studiometa/js-toolkit-v4/handler-registrations',
);
