# Static methods

## `$register(nameOrSelector?: string)`

Use the `$register` method to instantiate a class on each element matching the given component's name or CSS selector. This methods uses the [child component resolution](#components) to find components.

**Parameters**

- `nameOrSelector` (`string`): the name of the component or a CSS selector

**Return value**

- `Base[]`: an array of instances of the component that triggered the method

```js twoslash
import { Base } from '@studiometa/js-toolkit';

class Component extends Base {
  static config = {
    name: 'Component',
  };
}

// Will mount the Component class on `[data-component="Component"]` elements
Component.$register();

// Will mount the Component class on `[data-component="Foo"]` elements
Component.$register('Foo');

// Will look the component class on `.my-component` elements
Component.$register('.my-component');
```
