let count = 0;

/** Create a unique, stable instance ID. */
export function uid(prefix: string): string {
  count += 1;
  return `${prefix}-${count}`;
}
