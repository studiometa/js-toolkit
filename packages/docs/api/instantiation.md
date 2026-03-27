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

:::tip Recommended
Use the [`registerComponent(Component)`](./helpers/registerComponent.html) function to register and mount components independently — no need for a monolithic App class.
:::

:::tip
Use the [`$register(nameOrSelector?: string)`](./static-methods.html#factory-nameorselector) static method to instantiate multiple instances on elements matching a name (e.g. `[data-component="<name>"]`) or a CSS selector.
:::

:::tip
Use the [`createApp(Base, rootElement)`](./helpers/createApp.html) function when you need to configure global features (breakpoints, attributes, blocking) or access the root app instance.
:::

## Examples

### Using `registerComponent` (recommended)

Register and mount components independently:

::: code-group

```js twoslash [app.js]
import { registerComponent } from '@studiometa/js-toolkit';
import Component from './Component.js';

registerComponent(Component);
```

```js twoslash [Component.js]
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
  };
}
```

:::

### Using `createApp`

Use `createApp` when you need to configure global features or access the root app instance:

::: code-group

```js twoslash [app.js]
import { Base, createApp } from '@studiometa/js-toolkit';
import Component from './Component.js';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Component,
    },
  };
}

export default createApp(App);
```

```js twoslash [Component.js]
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
  };
}
```

:::
