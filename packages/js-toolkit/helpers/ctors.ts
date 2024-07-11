import type { BaseConstructor } from '../Base/index.js';

const ctors = new Set<BaseConstructor>();

/**
 * Get all constructed constructors.
 * @todo transform the set to be readonly to avoid removing a registered ctor?
 * @todo return an array?
 */
export function getConstructors() {
  return ctors;
}

export function addConstructor(ctor: BaseConstructor) {
  ctors.add(ctor);
}
