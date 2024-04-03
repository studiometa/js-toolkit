---
outline: deep
---

# withMountWhenInView

Use this decorator to create a component which will mount and destroy itself based on its visibility in the viewport.

## Usage

```js
import { Base, withMountWhenInView } from '@studiometa/js-toolkit';
import Component from './Component.js';

export default withMountWhenInView(Component, { threshold: [0, 1] });
```

### Parameters

- `Base` (`BaseConstructor`): The `Base` class or a class extending it.
- `options` (`IntersectionObserverInit`): Options for the `IntersectionObserver` instance.

### Return value

- `BaseConstructor`: A child class of the given class which will be mounted when visible and destroyed when invisible.

## API

This decorator does not expose a specific API.

## Examples

### Simple usage

```js{1,3,10,14}
import { Base, withMountWhenInView } from '@studiometa/js-toolkit';

export default class Component extends withMountWhenInView(Base) {
  static config = {
    name: 'Component',
    log: true,
  };

  mounted() {
    this.$log('I am visible!')
  }

  destroyed() {
    this.$log('I am no longer visible.');
  }
}
```

### With custom options

You can pass custom options for the `IntersectionObserver` instance by passing a second parameter to the `withMountWhenInView` function:

```js{1,3-5}
import { Base, withMountWhenInView } from '@studiometa/js-toolkit';

export default class Component extends withMountWhenInView(Base, {
  threshold: 0.5,
}) {
  static config = {
    name: "Component",
  };

  mounted() {
    this.$log('I am visible!')
  }

  destroyed() {
    this.$log('I am no longer visible.');
  }
}
```

Or at the instance level in the `data-option-intersection-observer` attribute of the root element:

```html{3-5}
<div
  data-component="Component"
  data-option-intersection-observer='{
    "threshold": 0.5
  }'>
  ...
</div>
```
