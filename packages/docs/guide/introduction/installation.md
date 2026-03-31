# Installation

::: tip New to js-toolkit?
Read the [introduction](/guide/) first to understand what js-toolkit is and how it works.
:::

## Package installation

Install the package from npm:

```bash
npm install @studiometa/js-toolkit
```

## Quick setup

### Recommended: `registerComponent`

The simplest way to get started is to use `registerComponent`, which automatically mounts your component on any matching DOM element:

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

### Alternative: `defineFeatures`

Use `defineFeatures` to configure global settings like breakpoints or HTML attributes when using `registerComponent` instead of `createApp`:

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

The toolkit uses a `__DEV__` global to conditionally enable debug logs. Set it in your build tool configuration:

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

The package ships with TypeScript types and works out of the box — no additional `@types` package needed.

```ts
import { Base, BaseConfig } from '@studiometa/js-toolkit';

class MyComponent extends Base {
  static config: BaseConfig = {
    name: 'MyComponent',
  };
}
```

## Hello World

A minimal example to verify everything is working:

```html
<!DOCTYPE html>
<html>
  <body>
    <div data-component="Hello">
      <button data-ref="btn">Say hello</button>
    </div>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

```js
// main.js
import { Base, registerComponent } from '@studiometa/js-toolkit';

class Hello extends Base {
  static config = {
    name: 'Hello',
    refs: ['btn'],
  };

  onBtnClick() {
    alert('Hello, world!');
  }
}

registerComponent(Hello);
```
