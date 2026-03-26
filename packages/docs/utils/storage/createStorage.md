# createStorage

Create a multi-key, typed storage instance with reactive subscriptions and automatic serialization.

## Usage

```js twoslash
import { createStorage, localStorageProvider } from '@studiometa/js-toolkit/utils';

const storage = createStorage({
  provider: localStorageProvider,
  prefix: 'myapp:',
});

// Set and get values
storage.set('theme', 'dark');
storage.get('theme'); // 'dark'

// Get with default value
storage.get('lang', 'en'); // 'en' (key not set yet)

// Subscribe to changes
const unsubscribe = storage.subscribe('theme', (value) => {
  console.log('Theme changed:', value);
});

// Clean up
unsubscribe();
storage.destroy();
```

## TypeScript

Use generics to type your storage keys and values:

```ts twoslash
import { createStorage } from '@studiometa/js-toolkit/utils';

type AppStorage = {
  theme: 'light' | 'dark';
  user: { name: string; id: number };
  lang: string;
};

const storage = createStorage<AppStorage>();

storage.set('theme', 'dark'); // ✅ typed
storage.set('theme', 'blue'); // ❌ type error
storage.get('user'); // { name: string; id: number } | null
```

## Parameters

- `options` (`StorageOptions`): Configuration options.
  - `options.provider` (`StorageProvider`): The storage provider to use. Defaults to `localStorageProvider`.
  - `options.serializer` (`StorageSerializer`): Custom serializer with `serialize` and `deserialize` methods. Defaults to JSON.
  - `options.prefix` (`string`): Key prefix for namespacing. All keys will be stored with this prefix (e.g. `'myapp:'` stores key `'theme'` as `'myapp:theme'`).

## Return value

A `StorageInstance<T>` with the following methods:

- **`get(key)`** — Get the value for a key. Returns `null` if not set.
- **`get(key, defaultValue)`** — Get the value for a key, returning `defaultValue` if not set.
- **`set(key, value)`** — Set a value. Pass `null` to remove the key.
- **`subscribe(key, callback)`** — Subscribe to changes on a key. Returns an unsubscribe function. Listeners are notified on both local changes and external sync events (cross-tab, navigation).
- **`destroy()`** — Clean up all listeners and event handlers.
