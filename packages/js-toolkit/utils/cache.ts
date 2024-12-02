const map = new Map();

/**
 * Cache the result of a callback in map instances.
 */
export function cache<T extends any>(keys: any[], callback: () => T): T {
  let value = map;
  let index = 1;

  for (const key of keys) {
    if (!value.has(key)) {
      const newValue = index === keys.length ? callback() : new Map();
      value.set(key, newValue);
    }

    value = value.get(key);
    index += 1;
  }

  return value as T;
}
