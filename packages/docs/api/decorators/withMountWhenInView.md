# withMountWhenInView

Use this decorator to create a component which will mount and destroy itself based on its visibility in the viewport.

## Usage

<label><input type="checkbox">todo</label>

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

Or at the instance level in the `data-option-intersection-observer` attribute of the rool element:

```html{3-5}
<div
  data-component="Component"
  data-option-intersection-observer='{
    "threshold": 0.5
  }'>
  ...
</div>
```
