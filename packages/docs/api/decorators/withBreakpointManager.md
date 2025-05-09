---
outline: deep
---

# withBreakpointManager

Use this decorator to create a component that will have the capacity to switch components between different breakpoints.

## Usage

```js {5-8} twoslash
import { Base, withBreakpointManager } from '@studiometa/js-toolkit';
import MenuMobile from './MenuMobile';
import MenuDesktop from './MenuDesktop';

export default class Menu extends withBreakpointManager(Base, [
  ['xxs xs s', MenuMobile],
  ['m l xl xxl', MenuDesktop],
]) {
  static config = {
    name: 'Menu',
  };
}
```

### Parameters

- `Base` (`BaseConstructor`): The `Base` class or a class extending it.
- `options` (`Array<[string, BaseConstructor]>`): Definition for the components to be used for each breakpoints

### Return value

- `BaseConstructor`: A child class of the given class which will mount the given components based on the current active breakpoint

## Examples

### Switch between component classes

In the following example, the `MenuMobile` class will be mounted along the `Menu` class on small devices and destroyed on large devices. The `MenuDesktop` class will be mounted on large devices and destroyed on small ones.

The root element `this.$el` of each class will be the same.

```js {5-8} twoslash
import { Base, withBreakpointManager } from '@studiometa/js-toolkit';
import MenuMobile from './MenuMobile';
import MenuDesktop from './MenuDesktop';

export default class Menu extends withBreakpointManager(Base, [
  ['xxs xs s', MenuMobile],
  ['m l xl xxl', MenuDesktop],
]) {
  static config = {
    name: 'Menu',
  };
}
```

:::tip
See the [`resize` service documentation on breakpoints](/api/services/useResize.html#breakpoint) for a more comprehensive view of the potential values of the `activeBreakpoint` property.
:::
