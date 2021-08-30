---
sidebar: auto
sidebarDepth: 5
prev: /decorators/withIntersectionObserver.html
next: /decorators/withVue.html
---

# withMountWhenInView

Use this decorator to create a component which will mount and destroy itself based on its visibility in the viewport.

## Examples

### Simple usage

```js
import Base from '@studiometa/js-toolkit';
import withMountWhenInView from '@studiometa/js-toolkit/decorators/withMountWhenInView';

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

```js{4-6}
import Base from '@studiometa/js-toolkit';
import withMountWhenInView from '@studiometa/js-toolkit/decorators/withMountWhenInView';

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

## API

This decorator does not expose a specific API.
