import { isArray } from './is.js';

const map = new Map();

/**
 * Cache the result of a callback in map instances.
 * @link https://js-toolkit.studiometa.dev/utils/cache.html
*/
export function cache<T extends any>(keys: any | any[], callback: () => T): T {
  const normalizedKeys = isArray(keys) ? keys : [keys];
  let value = map;
  let index = 1;

  for (const key of normalizedKeys) {
    if (!value.has(key)) {
      const newValue = index === normalizedKeys.length ? callback() : new Map();
      value.set(key, newValue);
    }

    value = value.get(key);
    index += 1;
  }

  return value as T;
}
