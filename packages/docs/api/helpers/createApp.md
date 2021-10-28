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
- `rootElement` (`HTMLElement`): the root element for your app

**Return value**

- `useApp` (`() => Promise<Base>`): a function returning a promise which resolves to the app instance

## Example

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
