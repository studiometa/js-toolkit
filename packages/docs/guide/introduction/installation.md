# Installation

::: tip New to js-toolkit?
Read the [introduction](/guide/) first to understand what js-toolkit is and how it works.
:::

## Package installation

Install the package from npm:

```bash
npm install @studiometa/js-toolkit
```

### CDN

Import js-toolkit directly from a CDN, without a build step:

```html
<script type="module">
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
