---
outline: deep
---

# withIntersectionObserver

Use this decorator to create a class that will have the capacity to trigger an `intersected` method when the component's root element is in view.

## Usage

```js {1,3,11-13} twoslash
import { Base, withIntersectionObserver } from '@studiometa/js-toolkit';

class Component extends withIntersectionObserver(Base, {
  rootMargin: '100%',
}) {
  static config = {
    name: 'Component',
  };

  /**
   * @param {IntersectionObserverEntry[]} entries
   */
  intersected(entries) {
    console.log(entries);
  }
}
```

### Parameters

- `Base` (`BaseConstructor`): The `Base` class or a class extending it.
- `options` (`IntersectionObserverInit`): Options for the `IntersectionObserver` instance.

### Return value

- `BaseConstructor`: A child class of the given class which will trigger an `intersected` hook when visible.

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

```js {1,3,8-16} twoslash
import { Base, withIntersectionObserver } from '@studiometa/js-toolkit';

export default class Component extends withIntersectionObserver(Base) {
  static config = {
    name: 'Component',
  };

  /**
   * Triggered when the root element of the component is intersecting.
   * @param {IntersectionObserverEntry[]} entries
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

```js {3-5} twoslash
import { Base, withIntersectionObserver } from '@studiometa/js-toolkit';

export default class Component extends withIntersectionObserver(Base, {
  threshold: 0.5,
}) {
  static config = {
    name: 'Component',
  };

  /**
   * @param {IntersectionObserverEntry[]} entries
   */
  intersected(entries) {
    if (entries[0].isIntersecting) {
      this.isVisible = true;
    }
  }
}
```

Or at the instance level in the `data-option-intersection-observer` attribute of the root element:

```html {3-5}
<div
  data-component="Component"
  data-option-intersection-observer='{
    "threshold": 0.5
  }'>
  ...
</div>
```
