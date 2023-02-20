# withMountOnMediaQuery

Use this decorator to create a component which will mount and destroy itself based on a specified media query.

## Usage

```js
import { Base, withMountOnMediaQuery } from '@studiometa/js-toolkit';
import Component from './Component.js';

export default withMountOnMediaQuery(Component, 'not (prefers-reduced-motion)');
```

### Parameters

- `Base` (`BaseConstructor`): The `Base` class or a class extending it.
- `media` (`string`): a [media query](https://developer.mozilla.org/en-US/docs/Web/CSS/@media#media_features)

### Return value

- `BaseConstructor`: A child class of the given class which will be mounted when the media query matches.

## API

This decorator does not expose a specific API.

## Examples

### Simple usage

```js{1,5,13,17}
import { Base, withMountOnMediaQuery } from '@studiometa/js-toolkit';

export default class Component extends withMountOnMediaQuery(
  Base,
  'not (prefers-reduced-motion)',
) {
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

### With data option

```html{3}
<div
  data-component="Component"
  data-option-media="not (prefers-reduced-motion)">
  ...
</div>
```
