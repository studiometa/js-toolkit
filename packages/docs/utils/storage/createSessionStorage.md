# createSessionStorage

Create a storage instance backed by `globalThis.sessionStorage`. The underlying storage is resolved lazily from `globalThis` when the instance is used, so it can be imported before a browser-like global exists. Values persist for the duration of the page session when available.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"459d66cd4edc345b8db5735849a6e5cad362c44732d8c229c98df7d15ea3c07e","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEaRjMaAZXhwJYBWgilmAcxgAeACq86NMFDi8ASjBGaoeuGlLsw2ir2ZgMAPl4BeKxs7BycXNw8vb29GCCxxSTgAfkReAHkAW3Y0PXVNHRhUuNU4dwAdECxSYnZYUnLvbhTcrV0ASTBHTxF9A29SsHZ0rE00aVl5GCU4FUlm/MoQTtIGRABOKlYYVzR8JAAmAAYqNGZSXRWQGTlFZVU53QWOMFxEI8v8U+YxMiRVgF8KOhsC8CMQfscTHhbB1Ro48romhoWjB2p1RPprLZSPZHM5XO5PD5vAslisAOwANg2W20OyQZOOp3OeDhyMeLheeyoIg+Wm+5EQFIBQJweEIJHIEPoTDYnB4Y2uk1usyR+T0mOCuLCBMi0Vi8Q6yTSmWy9wKRQSZQqVSINTI9UavDNqJO6PVQWxITx4UJUX6g2GywVEymMzUqoeVFJSAAHFSQJttrtEIdGWcYBcriHleH4bgNhz9tzeV8aAKAIxCwHUYFisGS6iQxAgRiVWJkTB8SowfjsWhGrWuXgAH14wlgveeUBJJ2WSHLB3WCZpdMFaeZze7vdo7OeRfen35SAAzP9q5hRc3xeDG9Lm9DHLxWflEXmXV0MR6caF8REiTPThWctj2Pakk3pdcMxZCN8wTQtEAAFmLQ8yyQA5hRrS9QQlBYaDvFt0gzQgoD4Z0YQ/d0sW/b0dSJAA6OAMz0coNAAay2epGHYjAUhYiB2LAcp3CINhBBgFJCUdIgIBqAC50QcsEPLMDaWTUDqCZKDm0YhgCz3RDkL5VDEBjDCLxBa8GzwzMElhGDX2Rd83Q1T1Bx9XU5KAikAFYVNXBkNPTC5n0jOD9N8g8jJ+V4zNrK961wpsCKI6BSJgpzukozUf3c+idOYkA6CwdhZDgTjuN4wraGK0qhN4ETWDEiSvCkmTpyjWcgLJdTE1Uk9IOCqC9JeCKeRQ6LTPPOLsJvayoVsp97KddLyOcr8vW1P8ok8+dVnjXr/IG6C813F4ArGqKBXQqasMsxL8MYQidlS5a31WzKXOozbfW8OjzgKtiOJAaIKt4PiBPKR1CV4RgAGpy14etWAgZgSJ2lMDiQ5dwMQdTZw3EBmWGiDItLCa/gAXW5aAQQDEZeGAYMbmmO4YN4P4BCqdJeAAcgAAUcQQoAkJ7mAAegAKzgABaDQIFYVisjFwRxFYOAeYAbn6foHzsvN/CZpUWZVPNGEZrc+xSHnGONsBEB59nuC1wSYTzBiM0YHnAbAHn3B55gACMRHLPZjx5p3+hCmB3bQT2ipK+Bfd4Y8KQOA4I5dqO/o9r3+K2cONd4MWxd5wPg9DnmFlFpBQBMLYwzwKWQD+P4gA==="}
import { createSessionStorage } from '@studiometa/js-toolkit/utils';

const storage = createSessionStorage({ prefix: 'session:' });

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
