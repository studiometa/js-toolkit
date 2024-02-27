
# Getting started

## Installing
To install and use the latest version JS Toolkit in your project use

`npm install @studiometa/js-toolkit`


## Creating an app

To manage your components, it is recommend to use a single entry point which will import them. Dynamic imports can be used to only load components when they are needed.

```js
import { Base, createApp } from '@studiometa/js-toolkit';
import Component from './components/Component.js';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Component,
      AsyncComponent: () => import('./components/AsyncComponent.js'),
    },
  };
}

export default createApp(App, document.body);
```

The [`createApp`](/api/helpers/createApp.html) helper will instantiate your app when the window has been loaded to avoid blocking anything.

Now that you are set up to, let's look at practical recipes.

1. A [`counter`](/guide/recipes/counter-component/)
2. A [`scroll linked animation`](/guide/recipes/scroll-linked-animation/)
2. [`Teleport refs`](/guide/recipes/teleport-refs/)


