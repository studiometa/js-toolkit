# isDirectChild

Use the `isDirectChild` function to test if a child component instance is a direct descendant of the given parent instance. This function is helpful when working with nested components which declare themselves as children.

## Usage

```js {1,9,16}
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

  onChildClick(index, event) {
    const childInstance = this.$children.Child[index];

    if (isDirectChild(this, 'Parent', 'Child', childInstance)) {
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
