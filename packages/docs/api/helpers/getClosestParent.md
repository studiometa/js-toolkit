# getClosestParent

Use the `getClosestParent` function to get the closest instance of a given parent component.

## Usage

```js {1,9,15}
import { Base, getClosestParent } from '@studiometa/js-toolkit';
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
    const parent = getClosestParent(childInstance, Parent);

    if (parent === this) {
      event.preventDefault();
    }
  }
}
```

**Parameters**

- `childInstance` (`Base`): the instance from which to look up for the parent
- `parentConstructor` (`typeof Base`): the constructor of the parent component

**Return value**

- `Base | null`: the instance of the closes parent, `null` if no parent matching the constructor was found
