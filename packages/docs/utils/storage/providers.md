# Providers

Storage providers are the low-level adapters that read and write to a specific storage backend. You can use the built-in providers or create your own.

## Built-in providers

| Provider                        | Backend                     | Sync event            |
| ------------------------------- | --------------------------- | --------------------- |
| `localStorageProvider`          | `globalThis.localStorage`   | `storage` (cross-tab) |
| `memoryStorageProvider`         | in-memory `Map`             | none                  |
| `sessionStorageProvider`        | `globalThis.sessionStorage` | none                  |
| `urlSearchParamsProvider`       | URL search params           | `popstate`            |
| `urlSearchParamsInHashProvider` | URL hash params             | `hashchange`          |

`localStorageProvider` and `sessionStorageProvider` resolve their `globalThis.*Storage` backend lazily on each access instead of capturing it when the module is imported. This makes them safe to import before a browser-like global is available, and lets tests or non-DOM runtimes provide storage later.

## Provider factories

All built-in providers also have factory functions:

- `createNoopProvider()`
- `createLocalStorageProvider()`
- `createMemoryStorageProvider()`
- `createSessionStorageProvider()`
- `createUrlSearchParamsProvider(options?)`
- `createUrlSearchParamsInHashProvider(options?)`

Use the storage-backed factories when you want a fresh provider instance instead of the default singleton export.

The URL-based factories accept a `push` option to customize navigation behavior. They check for a browser context when the provider is created. If `window.location` or `window.history` is unavailable, they return a no-op provider instead of throwing.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"30cf328271aeb3e255906ba6983a8e307a2d394630a0ec98df4f6b582ee409ed","data":"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="}
import {
  createLocalStorageProvider,
  createMemoryStorageProvider,
  createNoopProvider,
  createSessionStorageProvider,
  createUrlSearchParamsProvider,
  createUrlSearchParamsInHashProvider,
} from '@studiometa/js-toolkit/utils';

const noopProvider = createNoopProvider();
const localProvider = createLocalStorageProvider();
const memoryProvider = createMemoryStorageProvider();
const sessionProvider = createSessionStorageProvider();

// Uses pushState instead of the default replaceState
const pushProvider = createUrlSearchParamsProvider({ push: true });
const pushHashProvider = createUrlSearchParamsInHashProvider({ push: true });
```

## Custom providers

Implement the `StorageProvider` interface to create a custom provider:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"ef4a6bd2f9278b2cad042696755d26ed2f767f0f77df66a4966d8949dd4a54f5","data":"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"}
import { createStorage } from '@studiometa/js-toolkit/utils';
import type { StorageProvider } from '@studiometa/js-toolkit/utils';

const cookieProvider: StorageProvider = {
  // Optional: DOM event name for external sync
  syncEvent: undefined,

  get(key: string): string | null {
    const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  },

  set(key: string, value: string): void {
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/`;
  },

  remove(key: string): void {
    document.cookie = `${key}=; path=/; max-age=0`;
  },

  has(key: string): boolean {
    return this.get(key) !== null;
  },

  keys(): string[] {
    return document.cookie
      .split('; ')
      .filter(Boolean)
      .map((c) => c.split('=')[0]);
  },

  clear(): void {
    for (const key of this.keys()) {
      this.remove(key);
    }
  },
};

const storage = createStorage({ provider: cookieProvider });
```

### The `syncEvent` property

Providers can declare a `syncEvent` string to indicate which DOM event should trigger re-reading values for subscribed keys. When set, `createStorage` will automatically listen to this event on `window` and notify subscribers.

- `'storage'` — for cross-tab sync (`localStorage`)
- `'popstate'` — for back/forward navigation (URL search params, browser-only)
- `'hashchange'` — for hash changes (URL hash params, browser-only)
- Any custom event name
- `undefined` — no automatic sync (used by `sessionStorageProvider`)
