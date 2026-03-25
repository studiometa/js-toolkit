---
outline: deep
---

# closestComponent

Use the `closestComponent` function to get the closest ancestor component instance matching a given query. This traverses up the DOM tree from the given element, similar to how `Element.closest()` works for CSS selectors.

## Usage

```js twoslash
import { Base, closestComponent } from '@studiometa/js-toolkit';

class Child extends Base {
  static config = {
    name: 'Child',
  };

  mounted() {
    // Get the closest parent 'Parent' instance
    const parent = closestComponent('Parent', { from: this.$el });
    if (parent) {
      // Do something with the parent instance
    }
  }
}
```

### CSS selector filtering

You can combine component name with a CSS selector:

```js twoslash
import { closestComponent } from '@studiometa/js-toolkit';

// Get the closest 'Parent' with id `#main`
const el = document.querySelector('.child');
const mainParent = closestComponent('Parent(#main)', { from: el });
```

**Parameters**

- `query` (`string`): a query string in the format `ComponentName(.cssSelector):state`
- `options` (`{ from: HTMLElement }`): the element from which to start traversing up the DOM

**Return value**

- `Base | undefined`: the closest matching ancestor instance, or `undefined` if none found
