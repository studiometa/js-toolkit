import { describe, it, expect } from 'vitest';
import { cache } from '@studiometa/js-toolkit/utils';

describe('cache function', () => {
  it('caches values with multiple keys', async () => {
    const keys = ['one', 'two', 'three'];
    const callback = () => new Map();
    expect(cache(keys, callback)).toBe(cache(keys, callback))
  });
});
