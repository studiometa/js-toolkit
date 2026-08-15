/**
 * Symbols used by component events and decorator initializers.
 *
 * `Symbol.for()` keeps their identity stable when two bundled package copies
 * run in one realm. The explicit annotations keep their `unique symbol` type,
 * so computed properties remain precise at compile time.
 */
export const SOURCE: unique symbol = Symbol.for('@studiometa/js-toolkit-v4/source');
export const HANDLER_REGISTRATIONS: unique symbol = Symbol.for(
  '@studiometa/js-toolkit-v4/handler-registrations',
);
