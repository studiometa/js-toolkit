# withMountWhenPrefersMotion

Use this decorator to create a component which will mount and destroy itself based on the `(prefers-reduced-motion)` media query.

## Usage

```js twoslash
import { Base, withMountWhenPrefersMotion } from '@studiometa/js-toolkit';
import Component from './Component.js';

export default withMountWhenPrefersMotion(Component);
```

### Parameters

- `Base` (`BaseConstructor`): The `Base` class or a class extending it.

### Return value

- `BaseConstructor`: A child class of the given class which will be mounted when the media query matches.

## API

This decorator does not expose a specific API.

## Examples

### Simple usage

```js {1,3,10,14} twoslash
import { Base, withMountWhenPrefersMotion } from '@studiometa/js-toolkit';

export default class Component extends withMountWhenPrefersMotion(Base) {
  static config = {
    name: 'Component',
    log: true,
  };

  mounted() {
    this.$log('Accepts motion!');
  }

  destroyed() {
    this.$log('User enabled reduced motion after mount.');
  }
}
```
