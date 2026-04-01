---
outline: deep
---

# isDirectChild

Use the `isDirectChild` function to test if a child component instance is a direct descendant of the given parent instance. This function is helpful when working with nested components which declare themselves as children.

## Usage

```js {1,9,14} twoslash
// @twoslash-cache: {"v":1,"hash":"b6ac9a2c6b6b5510651f91e58012094659e5edbc4a5b5c9212866a7f1039956b","data":"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"}
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
