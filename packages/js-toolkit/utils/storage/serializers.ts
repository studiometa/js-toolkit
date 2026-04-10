import type { StorageSerializer } from './types.js';

export const jsonSerializer: StorageSerializer = {
  serialize: <T>(value: T): string => JSON.stringify(value),
  deserialize: <T>(value: string): T | undefined => {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  },
};
