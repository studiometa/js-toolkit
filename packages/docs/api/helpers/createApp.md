---
outline: deep
---

# createApp

Use the `createApp` function to instantiate your application on page load while being able to use the instance in other files.

## Usage

```js{1,4,6}
import { createApp } from '@studiometa/js-toolkit';
import App from './app.js';

const useApp = createApp(App, document.body);

useApp().then(app => /* ... */);
```

**Parameters**

- `App` (`typeof Base`): the class for your app

The second parameter can either be one of the following:

1. `rootElement` (`HTMLElement`): the root element for your app, defaults to `document.body`
2. `options` (`Object`): an object to configure more advanced options
   - `options.root` (`HTMLElement`): the root element for your app, defaults to `document.body`
   - `options.breakpoints` (`Record<string, string>`): a list of breakpoints to confgure the [`useResize` service](/api/services/useResize)
   - `options.mountState` (`'interactive'|'complete'`): the loading state when the app should be mounted, defaults to `complete` (see [the `document.readyState` documentation](https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState) for more details)

**Return value**

- `useApp` (`() => Promise<Base>`): a function returning a promise which resolves to the app instance

## Examples

### Basic usage

Use the `createApp` function to export your app:

```js{1,9}
import { Base, createApp } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
  };
}

export default createApp(App, document.body);
```

And import it in other files to access your app instance when it is mounted:

```js{1,4-5}
import useApp from './app.js';

(async () => {
  const app = await useApp();
  console.log(app.$el); // document.body
})()
```

### Configure breakpoints

You can configure the breakpoints used by your application by passing an options object as second parameter:

```js
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

### Configure when the app is mounted

By default, the app will be mounted when the `document.readyState` property is `complete` (just before the load event is fired). You can configure this by specifying the `mountState` option:

```js
export default createApp(App, {
  mountState: 'interactive',
});
```

In `interactive` mode, the app will be mounted when the DOM has finished loading and the document has been parsed.
