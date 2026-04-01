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
// @twoslash-cache: {"v":1,"hash":"5cde8acb261d3360e4f8d332ad879dfda434f12f99321868976919b8508c6dc7","data":"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"}
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
