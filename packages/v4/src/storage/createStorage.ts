import { signal, type Signal } from '../context.js';
import { reportDiagnostic } from '../diagnostics.js';
import type { Unsubscribe } from '../services/service.js';
import { localStorageProvider } from './providers.js';
import { jsonSerializer } from './serializers.js';
import { useStorageSync } from './sync.js';
import type { StorageInstance, StorageOptions } from './types.js';

/**
 * Build a storage over a provider.
 *
 * Values are namespaced by `prefix`, serialized on the way in and out, and
 * observable per key.
 */
export function createStorage<T extends object = Record<string, unknown>>(
  options: StorageOptions = {},
): StorageInstance<T> {
  const { provider = localStorageProvider, serializer = jsonSerializer, prefix = '' } = options;

  /**
   * Signals hold the *serialized* value, so identity comparison is the right
   * one: two writes of an equal value settle to the same string and notify
   * once, where the deserialized objects would be distinct every time.
   *
   * They are created on first subscription — an unobserved key needs no state.
   */
  const signals = new Map<string, Signal<string | null>>();
  let subscriberCount = 0;
  let releases: Unsubscribe[] = [];

  function resolveKey(key: string): string {
    return `${prefix}${key}`;
  }

  function decode(key: string, raw: string | null): unknown {
    if (raw === null) {
      return undefined;
    }
    try {
      return serializer.deserialize(raw);
    } catch (error) {
      // A stored value that cannot be read is not the same as a missing one,
      // even though both fall back to the default.
      reportDiagnostic(
        'storage.deserialize-failed',
        `The value stored under "${resolveKey(key)}" could not be deserialized.`,
        error,
      );
      return undefined;
    }
  }

  /** Publish what the provider holds now. Unchanged keys notify nobody. */
  function refresh(): void {
    for (const [key, keySignal] of signals) {
      keySignal.value = provider.get(resolveKey(key));
    }
  }

  function retainSync(): void {
    subscriberCount += 1;
    if (subscriberCount > 1) {
      return;
    }
    releases = (provider.syncEvents ?? []).map((name) => useStorageSync(name).subscribe(refresh));
  }

  function releaseSync(): void {
    // `destroy()` resets the count, so a late unsubscribe must not go negative.
    if (subscriberCount === 0) {
      return;
    }
    subscriberCount -= 1;
    if (subscriberCount > 0) {
      return;
    }
    for (const release of releases) {
      release();
    }
    releases = [];
  }

  function publish(key: string, raw: string | null): void {
    const keySignal = signals.get(key);
    if (keySignal) {
      keySignal.value = raw;
    }
  }

  return {
    // Asserted because one implementation cannot satisfy both overloads: the
    // two differ only in whether a default rules `undefined` out.
    get: (key: string, defaultValue?: unknown) => {
      const value = decode(key, provider.get(resolveKey(key)));
      return value === undefined ? defaultValue : value;
    },

    set(key, value) {
      let raw: string;
      try {
        raw = serializer.serialize(value);
      } catch (error) {
        reportDiagnostic(
          'storage.serialize-failed',
          `The value for "${resolveKey(key as string)}" could not be serialized.`,
          error,
        );
        return;
      }
      provider.set(resolveKey(key as string), raw);
      publish(key as string, raw);
    },

    delete(key) {
      provider.remove(resolveKey(key as string));
      publish(key as string, null);
    },

    has(key) {
      return provider.has(resolveKey(key as string));
    },

    keys() {
      const keys = provider.keys();
      if (!prefix) {
        return keys as (keyof T)[];
      }
      return keys
        .filter((key) => key.startsWith(prefix))
        .map((key) => key.slice(prefix.length) as keyof T);
    },

    clear() {
      if (prefix) {
        // A prefixed storage owns its namespace, not the whole provider.
        for (const key of provider.keys()) {
          if (key.startsWith(prefix)) {
            provider.remove(key);
          }
        }
      } else {
        provider.clear();
      }
      for (const keySignal of signals.values()) {
        keySignal.value = null;
      }
    },

    subscribe(key, callback, { immediate = false } = {}) {
      const name = key as string;
      let keySignal = signals.get(name);
      if (!keySignal) {
        keySignal = signal(provider.get(resolveKey(name)));
        signals.set(name, keySignal);
      }

      retainSync();

      const unsubscribe = keySignal.subscribe((raw) => callback(decode(name, raw) as never), {
        immediate,
      });

      let isReleased = false;
      return () => {
        // Unsubscribe is idempotent; the sync refcount must not go negative.
        if (isReleased) {
          return;
        }
        isReleased = true;
        unsubscribe();
        releaseSync();
      };
    },

    destroy() {
      for (const release of releases) {
        release();
      }
      releases = [];
      subscriberCount = 0;
      signals.clear();
    },
  };
}
