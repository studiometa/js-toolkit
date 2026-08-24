/** Realm-stable private key with a `unique symbol` type. */
export const HANDLER_REGISTRATIONS: unique symbol = Symbol.for(
  '@studiometa/js-toolkit-v4/handler-registrations',
);

/**
 * Where an element publishes the instances mounted on it, keyed by component
 * name.
 *
 * A symbol rather than a string property: v3 keeps its own map under
 * `el.__base__` and stores a `'terminated'` string in it, so a v4 registry
 * reading that map found a string where an instance belongs and called
 * `$unmount()` on it. `Symbol.for` is realm-global, so evaluated copies of
 * this package still agree on the key.
 *
 * Not public API — `getInstance()`, `getInstances()`,
 * `getMountedInstances()` and `getUnmountedInstances()` are how consumers
 * resolve instances, by name, by element, or both. Between them they express
 * every read this map answers, so nothing has to reach for the symbol. From a
 * devtools console, where there is nothing to import, the realm-global key is
 * the whole recipe:
 * `$0[Symbol.for('@studiometa/js-toolkit-v4/instances')]`.
 */
export const INSTANCES: unique symbol = Symbol.for('@studiometa/js-toolkit-v4/instances');
