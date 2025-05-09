---
outline: deep
---

# createApp

Use the `createApp` function to instantiate your application on page load while being able to use the instance in other files.

## Usage

```js {1,4,6} twoslash
import { createApp } from '@studiometa/js-toolkit';
import App from './App.js';

const useApp = createApp(App);

useApp().then((app) => console.log(app));
```

**Parameters**

- `App` (`typeof Base`): the root class for your app

The second parameter can either be one of the following:

1. `rootElement` (`HTMLElement`): the root element for your app, defaults to `document.body`
2. `options` (`Object`): an object to configure more advanced options
   - `options.root` (`HTMLElement`): the root element for your app, defaults to `document.body`
   - `options.breakpoints` (`Record<string, string>`): a list of breakpoints to confgure the [`useResize` service](/api/services/useResize)
   - `options.blocking` (`boolean`): wether to enable the queue mechanism for the internals of the framework or not, defaults to `false`
   - `options.prefix` (`string`): customize the prefix used to search for components with custom element tag names, defaults to `tk`
   - `options.attributes` (`{ component: string, option: string, ref: string }`): the HTML attributes to use for the [HTML API](/api/html/), defaults to `data-component`, `data-option` and `data-ref`

**Return value**

- `useApp` (`() => Promise<Base>`): a function returning a promise which resolves to the app instance

## Examples

### Basic usage

Use the `createApp` function to export your app:

```js {1,9} twoslash
import { Base, createApp } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
  };
}

export default createApp(App);
```

And import it in other files to access your app instance when it is mounted:

```js {1,4-5}
import useApp from './app.js';

(async () => {
  const app = await useApp();
  console.log(app.$el); // document.body
})();
```

### Configure breakpoints

You can configure the breakpoints used by your application by passing an options object as second parameter:

```js twoslash
import { createApp } from '@studiometa/js-toolkit';
import App from './App.js';

export default createApp(App, {
  breakpoints: {
    xxs: '0px',
    xs: '480px',
    s: '768px',
    m: '1024px',
    l: '1280px',
    xl: '1440px',
    xxl: '1920px',
    xxxl: '2560px',
  },
});
```

### Configure the queue mechanism of the app

By default, the app will be created with a queue mechanism based on the [`SmartQueue` class](/utils/SmartQueue.html). This queue helps reduce JavaScript's blocking time when instantiating the application and all of its children by releasing the current loop every 40 ms.

If you wish to use a blocking strategy, you can disable the queue by passing the `blocking` option to `true`:

```js twoslash
import { createApp } from '@studiometa/js-toolkit';

export default createApp(App, {
  blocking: true,
});
```

### Configure the HTML API attributes

The default attributes used to interact with the DOM are `data-component`, `data-option-...` and `data-ref`. These can be configured by specifying the `attributes` property of the options parameter:

```js twoslash
import { createApp } from '@studiometa/js-toolkit';
import App from './App.js';

export default createApp(App, {
  attributes: {
    component: 'tk-is',
    option: 'tk-opt',
    ref: 'tk-ref',
  },
});
```

::: warning W3C validation
Be aware that using other attributes than `data-...` attributes will probably make your HTML fail W3C validation tests.
:::
