# withKeepUnmounted

Use this decorator to create a component which will mount only if the option `enabled` is active.

## Usage

```js
import { Base, withKeepUnmounted } from '@studiometa/js-toolkit';
import Component from './Component.js';

export default withKeepUnmounted(Component);
```

### Parameters

- `Base` (`BaseConstructor`): The `Base` class or a class extending it.
- `autoMount` (`boolean`): Watch the `enabled` option to mount automatically. Default to `true`.

### Return value

- `BaseConstructor`: A child class of the given class which will be mounted when the media query matches.

## API

This decorator does not expose a specific API.

## Examples

### Simple usage

```js{1, 3}
import { Base, withKeepUnmounted } from '@studiometa/js-toolkit';

export default class UnmountedComponent extends withKeepUnmounted(Base) {
  static config = {
    name: 'UnmountedComponent',
    log: true,
  };

  mounted() {
    this.$log('Enabled and mounted.');
  }
}
```

```js{2, 8, 15}
import { Base, createApp } from '@studiometa/js-toolkit';
import UnmountedComponent from './UnmountedComponent.js';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      UnmountedComponent,
    },
    refs: ['btn'],
  };

  onBtnClick() {
    // Set the enabled option to `true` will mount the component
    this.$children.UnmountedComponent[0].$options.enabled = true;
  }
}

createApp(App);
```
