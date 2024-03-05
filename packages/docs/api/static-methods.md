# Static methods

## `$register(nameOrSelector?: string)`

Use the `$register` method to instantiate a class on each element matching the given component's name or CSS selector. This methods uses the [child component resolution](#components) to find components.

**Parameters**

- `nameOrSelector` (`string`): the name of the component or a CSS selector

**Return value**

- `Base[]`: an array of instances of the component that triggered the method
