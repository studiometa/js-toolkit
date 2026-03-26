# Providers

Storage providers are the low-level adapters that read and write to a specific storage backend. You can use the built-in providers or create your own.

## Built-in providers

| Provider | Backend | Sync event |
|---|---|---|
| `localStorageProvider` | `localStorage` | `storage` (cross-tab) |
| `sessionStorageProvider` | `sessionStorage` | `storage` (cross-tab) |
| `urlSearchParamsProvider` | URL search params | `popstate` |
| `urlSearchParamsInHashProvider` | URL hash params | `hashchange` |

### Provider factories

For URL-based providers, factory functions allow customizing the history behavior:

```js twoslash
import {
  createUrlSearchParamsProvider,
  createUrlSearchParamsInHashProvider,
} from '@studiometa/js-toolkit/utils';

// Uses pushState instead of the default replaceState
const pushProvider = createUrlSearchParamsProvider({ push: true });
const pushHashProvider = createUrlSearchParamsInHashProvider({ push: true });
```

## Custom providers

Implement the `StorageProvider` interface to create a custom provider:

```ts twoslash
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

- `'storage'` — for cross-tab sync (localStorage/sessionStorage)
- `'popstate'` — for back/forward navigation (URL search params)
- `'hashchange'` — for hash changes (URL hash params)
- Any custom event name
- `undefined` — no automatic sync
