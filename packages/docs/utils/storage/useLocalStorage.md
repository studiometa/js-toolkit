# useLocalStorage

Create a storage instance backed by `localStorage`. Values persist across page reloads and are synced across tabs via the `storage` event.

## Usage

```js twoslash
import { useLocalStorage } from '@studiometa/js-toolkit/utils';

const storage = useLocalStorage({ prefix: 'myapp:' });

storage.set('theme', 'dark');
storage.get('theme'); // 'dark'
storage.get('lang', 'en'); // 'en' (default)

// React to changes (including from other tabs)
const unsubscribe = storage.subscribe('theme', (value) => {
  document.documentElement.dataset.theme = value;
});
```

## Parameters

- `options` (`StorageOptions`): Optional configuration.
  - `options.prefix` (`string`): Key prefix for namespacing.
  - `options.serializer` (`StorageSerializer`): Custom serializer. Defaults to JSON.

## Return value

- `StorageInstance<T>`: See [createStorage](./createStorage.html#return-value) for the full API.
