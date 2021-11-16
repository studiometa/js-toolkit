# Static methods

## `$factory(nameOrSelector)`

Use the `$factory` method to instantiate a class on each element matching the given component's name or CSS selector. This methods works like the [child component resolution](#components).

**Parameters**

- `nameOrSelector` (`String`): the name of the component or a CSS selector

**Return value**

- `Base[]`: an array of instances of the component that triggered the method
