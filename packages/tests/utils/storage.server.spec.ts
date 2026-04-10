// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();

  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key) {
      return map.get(key) ?? null;
    },
    key(index) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key) {
      map.delete(key);
    },
    setItem(key, value) {
      map.set(key, value);
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('Storage utilities in a non-browser context', () => {
  it('should use globalThis.localStorage without window', async () => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    vi.stubGlobal('sessionStorage', createMemoryStorage());
    vi.stubGlobal('window', undefined);

    const { createLocalStorage } = await import('@studiometa/js-toolkit/utils');
    const storage = createLocalStorage<{ theme: string }>();

    storage.set('theme', 'dark');

    expect(storage.get('theme')).toBe('dark');
    expect(globalThis.localStorage.getItem('theme')).toBe(JSON.stringify('dark'));
  });

  it('should use globalThis.sessionStorage without window', async () => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    vi.stubGlobal('sessionStorage', createMemoryStorage());
    vi.stubGlobal('window', undefined);

    const { createSessionStorage } = await import('@studiometa/js-toolkit/utils');
    const storage = createSessionStorage<{ token: string }>();

    storage.set('token', 'abc123');

    expect(storage.get('token')).toBe('abc123');
    expect(globalThis.sessionStorage.getItem('token')).toBe(JSON.stringify('abc123'));
  });

  it('should return noop URL providers without window', async () => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    vi.stubGlobal('sessionStorage', createMemoryStorage());
    vi.stubGlobal('window', undefined);

    const {
      createUrlSearchParamsProvider,
      createUrlSearchParamsInHashProvider,
      createUrlSearchParamsStorage,
      createUrlSearchParamsInHashStorage,
    } = await import('@studiometa/js-toolkit/utils');

    const searchProvider = createUrlSearchParamsProvider();
    const hashProvider = createUrlSearchParamsInHashProvider();
    const searchStorage = createUrlSearchParamsStorage<{ page: number }>();
    const hashStorage = createUrlSearchParamsInHashStorage<{ tab: string }>();

    searchProvider.set('page', '1');
    hashProvider.set('tab', 'settings');
    searchStorage.set('page', 1);
    hashStorage.set('tab', 'settings');

    expect(searchProvider.get('page')).toBeNull();
    expect(hashProvider.get('tab')).toBeNull();
    expect(searchProvider.has('page')).toBe(false);
    expect(hashProvider.has('tab')).toBe(false);
    expect(searchProvider.keys()).toEqual([]);
    expect(hashProvider.keys()).toEqual([]);
    expect(searchStorage.get('page')).toBeUndefined();
    expect(hashStorage.get('tab')).toBeUndefined();
  });
});
