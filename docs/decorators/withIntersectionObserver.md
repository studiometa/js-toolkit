---
sidebar: auto
sidebarDepth: 5
prev: /decorators/withBreakpointObserver.html
next: /components/
---

# withIntersectionObserver

Use this decorator to create a class that will have the capacity to trigger an `intersected` method when the component's root element is in view.

## Examples

### Simple usage

```js{4,11-19}
import { Base } from '@studiometa/js-toolkit/abstracts';
import { withIntersectionObserver } from '@studiometa/js-toolkit/decorators';

export default class Component extends withIntersectionObserver(Base) {
  get config() {
    return {
      name: 'Component',
    };
  }

  /**
   * Triggered when the root element of the component is intersecting.
   * @param  {Array<IntersectionObserverEntry>} entries
   */
  intersected(entries) {
    if (entries[0].isIntersecting) {
      this.isVisible = true;
    }
  }
}
```

### With custom options

You can use custom options for the `IntersectionObserver` instance used by passing a second parameter to the `withIntersectionObserver` function:

```js{4-6}
import { Base } from '@studiometa/js-toolkit/abstracts';
import { withIntersectionObserver } from '@studiometa/js-toolkit/decorators';

export default class Component extends withIntersectionObserver(Base, {
  threshold: 0.5,
}) {
  get config() {
    return {
      name: "Component",
    };
  }

  intersected(entries) {
    if (entries[0].isIntersecting) {
      this.isVisible = true;
    }
  }
}
```

Or by setting an `intersectionObserver` object in the class configuration:

```js{8-10}
import { Base } from '@studiometa/js-toolkit/abstracts';
import { withIntersectionObserver } from '@studiometa/js-toolkit/decorators';

export default class Component extends withIntersectionObserver(Base) {
  get config() {
    return {
      name: "Component",
      intersectionObserver: {
        threshold: 0.5,
      },
    };
  }

  intersected(entries) {
    if (entries[0].isIntersecting) {
      this.isVisible = true;
    }
  }
}
```

Or at the instance level in the `data-options` attribute of the rool element:

```html{3-7}
<div
  data-component="Component"
  data-options='{
    "intersectionObserver": {
      "threshold": 0.5
    }
  }'>
  ...
</div>
```

## API

### Instance properties

#### `$observer`

The `$observer` instance property holds the instance of `IntersectionObserver`.

### Class methods

#### `intersected`

The `intersected` class method will be used as the callback for the `IntersectionObserver` instance.

**Arguments**

- `entries` (`Array<IntersectionObserverEntry>`): an array of `IntersectionObserverEntry`  objects.

:::tip
Read the [`IntersectionObserver` documentation](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) for more informations on how to use its&nbsp;API.
:::

### Events

#### `intersected`

Emitted when the [`intersected`](#intersected) class method is triggered.

**Parameters**

- `entries` (`Array<IntersectionObserverEntry>`): an array of `IntersectionObserverEntry`  objects.
