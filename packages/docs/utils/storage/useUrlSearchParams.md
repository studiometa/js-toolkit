# useUrlSearchParams

Create a storage instance backed by URL search params (`?key=value`). Useful for shareable UI state like filters, pagination, or sort order.

By default, changes use `replaceState` to avoid polluting browser history. Use `{ push: true }` to create history entries instead.

## Usage

```js twoslash
import { useUrlSearchParams } from '@studiometa/js-toolkit/utils';

const storage = useUrlSearchParams();

// URL: /products
storage.set('page', 2);
// URL: /products?page=2

storage.set('sort', 'price');
// URL: /products?page=2&sort=%22price%22

storage.get('page'); // 2

// React to back/forward navigation
storage.subscribe('page', (value) => {
  console.log('Page changed:', value);
});
```

### With history entries

```js twoslash
import { useUrlSearchParams } from '@studiometa/js-toolkit/utils';

// Each set() creates a new history entry
const storage = useUrlSearchParams({ push: true });
```

## Parameters

- `options` (`StorageOptions & UrlProviderOptions`): Optional configuration.
  - `options.prefix` (`string`): Key prefix for namespacing.
  - `options.serializer` (`StorageSerializer`): Custom serializer. Defaults to JSON.
  - `options.push` (`boolean`): Use `pushState` instead of `replaceState`. Defaults to `false`.

## Return value

- `StorageInstance<T>`: See [createStorage](./createStorage.html#return-value) for the full API.
