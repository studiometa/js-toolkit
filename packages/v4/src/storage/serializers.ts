import type { StorageSerializer } from './types.js';

/**
 * The default serializer. `deserialize` throws on malformed input so the
 * storage instance can name the key it failed on.
 */
export const jsonSerializer: StorageSerializer = {
  serialize: (value) => JSON.stringify(value),
  deserialize: (value) => JSON.parse(value),
};
