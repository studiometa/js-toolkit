import type { BaseConstructor } from './Base.js';

const BASE_BRAND = Symbol.for('@studiometa/js-toolkit-v4/base');

/** Mark the canonical base constructor and prototype without a public export. */
export function brandBaseConstructor(ComponentClass: BaseConstructor): void {
  Object.defineProperty(ComponentClass, BASE_BRAND, { value: true });
  Object.defineProperty(ComponentClass.prototype, BASE_BRAND, { value: true });
}

/**
 * Recognise v4 component classes from this or another evaluated package copy.
 * A normal function, importer, or unrelated class has neither inherited brand.
 */
export function isBaseConstructor(value: unknown): value is BaseConstructor {
  if (typeof value !== 'function') {
    return false;
  }
  const candidate = value as unknown as {
    [BASE_BRAND]?: unknown;
    config?: unknown;
    prototype?: { [BASE_BRAND]?: unknown };
  };
  const config = candidate.config as { name?: unknown } | undefined;
  return (
    candidate[BASE_BRAND] === true &&
    candidate.prototype?.[BASE_BRAND] === true &&
    typeof config === 'object' &&
    config !== null &&
    typeof config.name === 'string'
  );
}
