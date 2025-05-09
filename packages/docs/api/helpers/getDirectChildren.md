---
outline: deep
---

# getDirectChildren

Use the `getDirectChildren` function to get a list components which are direct descendants of the given parent instance. This function is helpful when working with nested components which declare themselves as children.

:::tip
If you need to only check if an instance is a direct descendant of another instance, prefer the [`isDirectChild` helper function](/api/helpers/isDirectChild.md) which will return a `boolean` directly.
:::

## Usage

```js {1,9,16} twoslash
import { Base, getDirectChildren } from '@studiometa/js-toolkit';
import Child from './Child.js';

class Parent extends Base {
  static config = {
    name: 'Parent',
    components: {
      Child,
      Parent, // Useful for recursive components only
    },
  };

  onChildClick({ target, event }) {
    const directChildren = getDirectChildren(this, 'Parent', 'Child');

    if (directChildren.includes(target)) {
      event.preventDefault();
    }
  }
}
```

**Parameters**

- `parentInstance` (`Base`): the target element
- `parentName` (`string`): the name of the recursive parent as specified in the `config.components` object.
- `childrenName` (`string`): the name of the children components as specified in the `config.components` object.

**Return value**

- `Base[]`: a list of the direct child components corresponding to the given `childrenName`
