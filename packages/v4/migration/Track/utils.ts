/** Report a malformed tracking declaration. */
export function warn(...args: unknown[]): void {
  console.warn('[Track]', ...args);
}
