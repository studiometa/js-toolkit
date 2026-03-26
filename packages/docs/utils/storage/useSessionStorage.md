# useSessionStorage

Create a storage instance backed by `sessionStorage`. Values persist for the duration of the page session.

## Usage

```js twoslash
import { useSessionStorage } from '@studiometa/js-toolkit/utils';

const storage = useSessionStorage({ prefix: 'session:' });

storage.set('token', 'abc123');
storage.set('expires', 3600);

storage.get('token'); // 'abc123'
```

## Parameters

- `options` (`StorageOptions`): Optional configuration.
  - `options.prefix` (`string`): Key prefix for namespacing.
  - `options.serializer` (`StorageSerializer`): Custom serializer. Defaults to JSON.

## Return value

- `StorageInstance<T>`: See [createStorage](./createStorage.html#return-value) for the full API.
