/** Normalize a size to the given step. */
export function normalizeSize(size: number, step: number): number {
  return Math.ceil(size / step) * step;
}
