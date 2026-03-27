# Installation

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

Use `defineFeatures` to explicitly configure which toolkit features are active in your app:

```js
import { defineFeatures } from '@studiometa/js-toolkit';

defineFeatures({ features: ['pointer', 'scroll', 'resize', 'raf'] });
```

### Advanced: `createApp`

For more control over initialization (e.g. lazy loading, custom root), use `createApp`:

```js
import { Base, createApp } from '@studiometa/js-toolkit';
import MyComponent from './components/MyComponent.js';

class App extends Base {
  static config = {
    name: 'App',
    components: { MyComponent },
  };
}

export default createApp(App, document.body);
```

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
