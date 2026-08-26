# fromWebpackContext

```ts
fromWebpackContext(context: WebpackContextLike): ModuleRecord
```

Adapts an `import.meta.webpackContext()` result for [`defineManifest()`](./defineManifest.html).

## Usage

```js
import { defineManifest, fromWebpackContext, registerManifest } from '@studiometa/js-toolkit';

registerManifest(
  defineManifest({
    modules: fromWebpackContext(
      import.meta.webpackContext('./components', {
        recursive: true,
        regExp: /\/index\.js$/,
        mode: 'lazy',
      }),
    ),
  }),
);
```

**Parameters**

- `context` (`WebpackContextLike`) — anything with the `keys()` method and the callable shape of a webpack context.

**Return value**

- `ModuleRecord` — a map of path to a **deferred** importer, one per key.

The import of each key is deferred rather than performed, so nothing is downloaded when the manifest is built. Use `mode: 'lazy'` so webpack emits a chunk per module.

The adapter adds **no webpack dependency**. `WebpackContextLike` is a structural type, so the adapter is testable without a bundler and core names webpack nowhere.
