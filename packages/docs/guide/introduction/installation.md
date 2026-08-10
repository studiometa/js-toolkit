# Installation

::: tip New to js-toolkit?
Read the [introduction](/guide/) first to understand what js-toolkit is and how it works.
:::

## Package installation

Install the package from npm:

```bash
npm install @studiometa/js-toolkit
```

## Import paths

Every export is reachable from the root barrel and from its own top-level subpath:

```js
// Barrel — one import for several symbols.
import { Base, registerComponent } from '@studiometa/js-toolkit';

// Subpath — one import per symbol.
import { Base } from '@studiometa/js-toolkit/Base';
import { registerComponent } from '@studiometa/js-toolkit/registerComponent';
```

Utils work the same way under the `utils` namespace:

```js
import { debounce } from '@studiometa/js-toolkit/utils';
import { debounce } from '@studiometa/js-toolkit/utils/debounce';
```

Each subpath resolves as both the named and the default export, so `import Base from '@studiometa/js-toolkit/Base'` works too.

The subpath key is the **exported symbol name**, not the file path — the history utils are published as `@studiometa/js-toolkit/utils/historyPush` and `@studiometa/js-toolkit/utils/historyReplace`. Paths reaching into the package layout (`utils/math/damp.js`) are not public API and are reported by the [`no-deep-utils-import`](/guide/going-further/linting.html) rule.

::: tip Which one should I use?
With a bundler, both cost the same — the barrel is tree-shaken away. Without a build step, prefer the subpath: it resolves to the module declaring the symbol, so the browser downloads that module instead of the whole barrel and everything it re-exports.
:::

### CDN

Import js-toolkit directly from a CDN, without a build step. Use the per-symbol subpaths here:

```html
<script type="module">
  import { Base } from 'https://esm.sh/@studiometa/js-toolkit/Base';
  import { registerComponent } from 'https://esm.sh/@studiometa/js-toolkit/registerComponent';
</script>
```

The root barrel also works, but it pulls in the module graph of every symbol it names:

```html
<script type="module">
  // Larger download: the whole barrel.
  import {
    Base,
    registerComponent,
  } from 'https://esm.sh/@studiometa/js-toolkit';
</script>
```

## Quick setup

### Recommended: `registerComponent`

Use `registerComponent` to mount your component automatically on any matching DOM element:

```js
import { Base, registerComponent } from '@studiometa/js-toolkit';

class MyComponent extends Base {
  static config = {
    name: 'MyComponent',
  };

  mounted() {
    console.log('MyComponent mounted!');
  }
}

registerComponent(MyComponent);
```

```html
<div data-component="MyComponent"></div>
```

### Global settings: `defineFeatures`

Use `defineFeatures` to configure framework-wide settings such as breakpoints, attributes, prefix, and blocking. It works alongside `registerComponent`:

```js
import { defineFeatures } from '@studiometa/js-toolkit';

defineFeatures({
  breakpoints: {
    s: '40rem',
    m: '80rem',
    l: '100rem',
  },
});
```

Available options: `breakpoints`, `blocking`, `prefix`, and `attributes`. See the [`defineFeatures` API](/api/helpers/defineFeatures.html) for details.

### Advanced: `createApp`

::: tip Prefer `registerComponent`
`createApp` is a legacy approach — the `js-toolkit/no-create-app` lint rule flags it. Prefer [`registerComponent`](/api/helpers/registerComponent.html) with [`defineFeatures`](/api/helpers/defineFeatures.html) for new projects.
:::

For more control over initialization (e.g. custom root element, breakpoints, or accessing the app instance from other files), use `createApp`:

```js
import { Base, createApp } from '@studiometa/js-toolkit';
import MyComponent from './components/MyComponent.js';

class App extends Base {
  static config = {
    name: 'App',
    components: { MyComponent },
  };
}

export default createApp(App, {
  root: document.body,
  breakpoints: {
    s: '48rem',
    m: '64rem',
    l: '80rem',
  },
});
```

`createApp` returns a function that resolves to the app instance, so you can use it in other files:

```js
import useApp from './app.js';

const app = await useApp();
console.log(app.$el); // document.body
```

See the [`createApp` API](/api/helpers/createApp.html) for all available options.

## Build tool configuration

js-toolkit uses a `__DEV__` global to conditionally enable debug logs. Set it in your build tool configuration:

### Vite

```js
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
});
```

### Webpack

```js
import webpack from 'webpack';

export default {
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    }),
  ],
};
```

## TypeScript

The package ships with TypeScript types and works without extra configuration — no separate `@types` package needed.

```ts
import { Base, BaseConfig } from '@studiometa/js-toolkit';

class MyComponent extends Base {
  static config: BaseConfig = {
    name: 'MyComponent',
  };
}
```

## Next steps

Follow the [Getting Started tutorial](/guide/) to build your first component step by step.
