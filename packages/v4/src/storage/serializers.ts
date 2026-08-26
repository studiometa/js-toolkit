import type { StorageSerializer } from './types.js';

/**
 * The default serializer. `deserialize` throws on malformed input so the
 * storage instance can name the key it failed on.
 * @link https://js-toolkit-v4.studiometa.dev/api/storage/createStorage.html
 */
export const jsonSerializer: StorageSerializer = {
  serialize: (value) => JSON.stringify(value),
  deserialize: (value) => JSON.parse(value) as unknown,
};
