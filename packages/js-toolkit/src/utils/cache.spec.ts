import { describe, it, expect } from 'vitest';
import { cache } from '@studiometa/js-toolkit/utils';

describe('cache function', () => {
  it('caches values with multiple keys', async () => {
    const cached = Symbol('cached');
    const keys = ['one', 'two', 'three'];
    const callback = () => cached;
    expect(cache(keys, callback)).toBe(cache(keys, callback));
    expect(cache(keys, callback)).toBe(cached);
  });

  it('caches values with single key', async () => {
    const cached = Symbol('cached');
    const key = 'un';
    const callback = () => cached;
    expect(cache(key, callback)).toBe(cache(key, callback));
    expect(cache(key, callback)).toBe(cached);
  });
});
