# useUrlSearchParamsInHash

Create a storage instance backed by URL hash params (`#key=value`). Useful for client-side state that shouldn't be sent to the server, like tab selection or UI mode.

By default, changes use `replaceState` to avoid polluting browser history. Use `{ push: true }` to create history entries instead.

## Usage

```js twoslash
import { useUrlSearchParamsInHash } from '@studiometa/js-toolkit/utils';

const storage = useUrlSearchParamsInHash();

// URL: /page
storage.set('tab', 'settings');
// URL: /page#tab=%22settings%22

storage.set('view', 'grid');
// URL: /page#tab=%22settings%22&view=%22grid%22

storage.get('tab'); // 'settings'

// React to hash changes
storage.subscribe('tab', (value) => {
  console.log('Tab changed:', value);
});
```

## Parameters

- `options` (`StorageOptions & UrlProviderOptions`): Optional configuration.
  - `options.prefix` (`string`): Key prefix for namespacing.
  - `options.serializer` (`StorageSerializer`): Custom serializer. Defaults to JSON.
  - `options.push` (`boolean`): Use `location.hash` assignment (creates history entry) instead of `replaceState`. Defaults to `false`.

## Return value

- `StorageInstance<T>`: See [createStorage](./createStorage.html#return-value) for the full API.
