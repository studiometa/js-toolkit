# withIntersectionObserver

Use this decorator to create a class that will have the capacity to trigger an `intersected` method when the component's root element is in view.

## Usage

<label><input type="checkbox">todo</label>

## API

### Interface methods

#### `intersected`

The `intersected` class method will be used as the callback for the `IntersectionObserver` instance.

**Arguments**

- `entries` (`Array<IntersectionObserverEntry>`): an array of `IntersectionObserverEntry` objects.

:::tip
Read the [`IntersectionObserver` documentation](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) for more informations on how to use its&nbsp;API.
:::

### Instance properties

#### `$observer`

The `$observer` instance property holds the instance of `IntersectionObserver`.

### Events

#### `intersected`

Emitted when the [`intersected`](#intersected) class method is triggered.

**Parameters**

- `entries` (`Array<IntersectionObserverEntry>`): an array of `IntersectionObserverEntry` objects.

## Examples

### Simple usage

```js{4,9-17}
import { Base, withIntersectionObserver } from '@studiometa/js-toolkit';

export default class Component extends withIntersectionObserver(Base) {
  static config = {
    name: 'Component',
  }

  /**
   * Triggered when the root element of the component is intersecting.
   * @param {Array<IntersectionObserverEntry>} entries
   */
  intersected(entries) {
    if (entries[0].isIntersecting) {
      this.isVisible = true;
    }
  }
}
```

### With custom options

You can pass custom options for the `IntersectionObserver` instance by passing a second parameter to the `withIntersectionObserver` function:

```js{4-6}
import { Base, withIntersectionObserver } from '@studiometa/js-toolkit';

export default class Component extends withIntersectionObserver(Base, {
  threshold: 0.5,
}) {
  static config = {
    name: "Component",
  };

  intersected(entries) {
    if (entries[0].isIntersecting) {
      this.isVisible = true;
    }
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
