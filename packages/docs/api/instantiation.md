# Instantiation

## Usage

```js {9-10} twoslash
import { Base } from '@studiometa/js-toolkit';

class Component extends Base {
  static config = {
    name: 'Component',
  };
}

const component = new Component(document.querySelector('.component'));
component.$mount();
```

**Parameters**

- `element` (`HTMLElement`): the root element of the component/application

**Return value**

Returns an instance of the class not yet mounted.

:::tip
Use the [`$register(nameOrSelector?: string)`](./static-methods.html#factory-nameorselector) static method to instantiate multiple instances on elements matching a name (e.g. `[data-component="<name>"]`) or a CSS selector.
:::

:::tip
Use the [`createApp(Base, rootElement)`](./helpers/createApp.html) function to instantiate the root class of your app.
:::

## Example

Create an app using a custom component and instantiate it:

::: code-group

```js twoslash [app.js]
import { Base } from '@studiometa/js-toolkit';
import Component from './Component.js';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Component,
    },
  };
}

const app = new App(document.body);
app.$mount();

export default app;
```

```js twoslash [Component.js]
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
  };
}
```

::: tip
Usage of the [`createApp` helper function](./helpers/createApp.md) is recommended instead of directly mounting the root component manually.
:::
