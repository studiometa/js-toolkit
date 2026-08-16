import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ToolkitDiagnosticDetail } from '../diagnostic-contract.js';
import { createStorage } from './createStorage.js';
import { createFallbackProvider, createMemoryStorageProvider } from './providers.js';
import type { StorageProvider } from './types.js';

/** Collect diagnostics dispatched while `during` runs, and silence the default sink. */
async function captureDiagnostics(
  during: () => Promise<void> | void,
): Promise<ToolkitDiagnosticDetail[]> {
  const seen: ToolkitDiagnosticDetail[] = [];
  const listener = (event: Event) => {
    seen.push((event as CustomEvent<ToolkitDiagnosticDetail>).detail);
    event.preventDefault();
  };
  document.addEventListener('js-toolkit:diagnostic', listener);
  try {
    await during();
  } finally {
    document.removeEventListener('js-toolkit:diagnostic', listener);
  }
  return seen;
}

describe('createStorage', () => {
  it('round-trips values through the serializer', () => {
    const storage = createStorage({ provider: createMemoryStorageProvider() });

    storage.set('theme', 'dark');
    storage.set('count', 3);
    storage.set('nested', { a: [1, 2] });

    expect(storage.get('theme')).toBe('dark');
    expect(storage.get('count')).toBe(3);
    expect(storage.get('nested')).toEqual({ a: [1, 2] });
  });

  it('returns the default for a missing key only', () => {
    const storage = createStorage<{ theme: string }>({ provider: createMemoryStorageProvider() });

    expect(storage.get('theme', 'light')).toBe('light');
    storage.set('theme', 'dark');
    expect(storage.get('theme', 'light')).toBe('dark');
  });

  it('namespaces keys, and keeps `keys` and `clear` inside the namespace', () => {
    const provider = createMemoryStorageProvider();
    const scoped = createStorage({ provider, prefix: 'app:' });
    provider.set('other', '"untouched"');

    scoped.set('theme', 'dark');
    expect(provider.get('app:theme')).toBe('"dark"');
    expect(scoped.keys()).toEqual(['theme']);

    scoped.clear();
    expect(provider.get('app:theme')).toBeNull();
    expect(provider.get('other')).toBe('"untouched"');
  });

  it('notifies subscribers of writes and deletions', () => {
    const storage = createStorage<{ theme: string }>({ provider: createMemoryStorageProvider() });
    const seen: Array<string | undefined> = [];
    const unsubscribe = storage.subscribe('theme', (value) => seen.push(value));

    storage.set('theme', 'dark');
    storage.delete('theme');
    unsubscribe();
    storage.set('theme', 'light');

    expect(seen).toEqual(['dark', undefined]);
  });

  it('delivers the current value when asked', () => {
    const storage = createStorage<{ theme: string }>({ provider: createMemoryStorageProvider() });
    storage.set('theme', 'dark');

    const seen: Array<string | undefined> = [];
    const unsubscribe = storage.subscribe('theme', (value) => seen.push(value), {
      immediate: true,
    });

    expect(seen).toEqual(['dark']);
    unsubscribe();
  });

  it('delivers once for a value that serializes the same', () => {
    const storage = createStorage<{ nested: { a: number } }>({
      provider: createMemoryStorageProvider(),
    });
    const seen: unknown[] = [];
    const unsubscribe = storage.subscribe('nested', (value) => seen.push(value));

    storage.set('nested', { a: 1 });
    storage.set('nested', { a: 1 });
    storage.set('nested', { a: 2 });

    expect(seen).toEqual([{ a: 1 }, { a: 2 }]);
    unsubscribe();
  });

  it('isolates a subscriber that throws', async () => {
    const storage = createStorage<{ theme: string }>({ provider: createMemoryStorageProvider() });
    const seen: Array<string | undefined> = [];
    const unsubscribeFailing = storage.subscribe('theme', () => {
      throw new Error('nope');
    });
    const unsubscribe = storage.subscribe('theme', (value) => seen.push(value));

    const diagnostics = await captureDiagnostics(() => storage.set('theme', 'dark'));

    expect(seen).toEqual(['dark']);
    expect(diagnostics.map((detail) => detail.code)).toEqual(['callback.signal-failed']);
    unsubscribeFailing();
    unsubscribe();
  });

  it('reports unreadable stored values and falls back to the default', async () => {
    const provider = createMemoryStorageProvider();
    provider.set('theme', '{not json');
    const storage = createStorage<{ theme: string }>({ provider });

    let value: string | undefined;
    const diagnostics = await captureDiagnostics(() => {
      value = storage.get('theme', 'light');
    });

    expect(value).toBe('light');
    expect(diagnostics.map((detail) => detail.code)).toEqual(['storage.deserialize-failed']);
  });

  it('reports an unserializable value instead of writing it', async () => {
    const provider = createMemoryStorageProvider();
    const storage = createStorage<{ loop: unknown }>({ provider });
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    const diagnostics = await captureDiagnostics(() => storage.set('loop', circular));

    expect(diagnostics.map((detail) => detail.code)).toEqual(['storage.serialize-failed']);
    expect(provider.has('loop')).toBe(false);
  });

  it('destroys subscriptions, and tolerates a late unsubscribe', () => {
    const storage = createStorage<{ theme: string }>({ provider: createMemoryStorageProvider() });
    const seen: unknown[] = [];
    const unsubscribe = storage.subscribe('theme', (value) => seen.push(value));

    storage.destroy();
    storage.set('theme', 'dark');
    expect(seen).toEqual([]);

    expect(() => {
      unsubscribe();
      unsubscribe();
    }).not.toThrow();
  });
});

describe('createStorage sync', () => {
  const listeners = new Map<string, number>();

  afterEach(() => {
    listeners.clear();
    vi.restoreAllMocks();
  });

  /** A provider whose backing map can change without going through the storage. */
  function createSyncableProvider(): StorageProvider & { external: Map<string, string> } {
    const external = new Map<string, string>();
    return {
      external,
      syncEvents: ['test-sync'],
      get: (key) => external.get(key) ?? null,
      set: (key, value) => void external.set(key, value),
      remove: (key) => void external.delete(key),
      has: (key) => external.has(key),
      keys: () => [...external.keys()],
      clear: () => external.clear(),
    };
  }

  it('re-reads observed keys on a sync event, and delivers only real changes', () => {
    const provider = createSyncableProvider();
    const storage = createStorage<{ theme: string; other: string }>({ provider });
    const seen: Array<string | undefined> = [];
    const unsubscribe = storage.subscribe('theme', (value) => seen.push(value));

    provider.external.set('theme', '"dark"');
    window.dispatchEvent(new Event('test-sync'));
    expect(seen).toEqual(['dark']);

    // A second event with no change notifies nobody.
    window.dispatchEvent(new Event('test-sync'));
    expect(seen).toEqual(['dark']);

    unsubscribe();
  });

  it('listens only while a key is observed', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const provider = createSyncableProvider();
    const storage = createStorage<{ a: string; b: string }>({ provider });

    const countFor = (spy: typeof add) =>
      spy.mock.calls.filter(([type]) => type === 'test-sync').length;

    expect(countFor(add)).toBe(0);

    const first = storage.subscribe('a', () => {});
    const second = storage.subscribe('b', () => {});
    expect(countFor(add)).toBe(1);

    first();
    expect(countFor(remove)).toBe(0);
    second();
    expect(countFor(remove)).toBe(1);
  });
});

describe('createFallbackProvider', () => {
  it('reads from the first provider holding the key', () => {
    const primary = createMemoryStorageProvider();
    const secondary = createMemoryStorageProvider();
    const provider = createFallbackProvider(primary, secondary);
    const storage = createStorage<{ theme: string }>({ provider });

    secondary.set('theme', '"dark"');
    expect(storage.get('theme')).toBe('dark');

    primary.set('theme', '"light"');
    expect(storage.get('theme')).toBe('light');
  });

  it('writes through to every provider', () => {
    const primary = createMemoryStorageProvider();
    const secondary = createMemoryStorageProvider();
    const storage = createStorage<{ theme: string }>({
      provider: createFallbackProvider(primary, secondary),
    });

    storage.set('theme', 'dark');
    expect(primary.get('theme')).toBe('"dark"');
    expect(secondary.get('theme')).toBe('"dark"');

    storage.delete('theme');
    expect(primary.has('theme')).toBe(false);
    expect(secondary.has('theme')).toBe(false);
  });

  it('merges the sync events of its providers', () => {
    const provider = createFallbackProvider(
      { ...createMemoryStorageProvider(), syncEvents: ['a', 'b'] },
      { ...createMemoryStorageProvider(), syncEvents: ['b', 'c'] },
    );

    expect(provider.syncEvents).toEqual(['a', 'b', 'c']);
  });
});
