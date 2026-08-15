import type { BaseConstructor } from './Base.js';

/** @internal The realm-stable key owned by `Base` and inherited by subclasses. */
export const BASE_BRAND = Symbol.for('@studiometa/js-toolkit-v4/base');

/**
 * Recognise v4 component classes from this or another evaluated package copy.
 * A normal function, importer, or unrelated class has no inherited brand.
 */
export function isBaseConstructor(value: unknown): value is BaseConstructor {
  if (typeof value !== 'function') {
    return false;
  }
  const candidate = value as unknown as {
    [BASE_BRAND]?: unknown;
    config?: unknown;
    prototype?: unknown;
  };
  const config = candidate.config as { name?: unknown } | undefined;
  return (
    candidate[BASE_BRAND] === true &&
    typeof candidate.prototype === 'object' &&
    candidate.prototype !== null &&
    typeof config === 'object' &&
    config !== null &&
    typeof config.name === 'string'
  );
}
