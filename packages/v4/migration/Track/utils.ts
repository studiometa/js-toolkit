/**
 * Report a malformed declaration to the developer.
 *
 * v3 calls `this.$warn(...)`, which prefixes the component's name and is
 * silent unless `data-option-log` is set. v4 has neither (REPORT.md gap 10),
 * so the six call sites in this family share one local function — the same
 * substitution the `Data*` port made for its four.
 *
 * The prefix is hard-coded rather than derived from the instance, because
 * every call site is inside the `Track` family and none of them has anything
 * more specific to say than "a `data-track` declaration is malformed".
 */
export function warn(...args: unknown[]): void {
  console.warn('[Track]', ...args);
}
