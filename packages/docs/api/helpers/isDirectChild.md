---
outline: deep
---

# isDirectChild

Use the `isDirectChild` function to test if a child component instance is a direct descendant of the given parent instance. This function is helpful when working with nested components which declare themselves as children.

## Usage

```js {1,9,14} twoslash
import { Base, isDirectChild } from '@studiometa/js-toolkit';
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
    if (isDirectChild(this, 'Parent', 'Child', target)) {
      event.preventDefault();
    }
  }
}
```

**Parameters**

- `parentInstance` (`Base`): the parent instance.
- `parentName` (`string`): the name of the recursive parent as specified in the `config.components` object.
- `childName` (`string`): the name of the child component as specified in the `config.components` object.
- `childInstance` (`Base`): the child instance.

**Return value**

- `boolean`: `true` if the given child instance is a direct descendant of the given parent instance.
