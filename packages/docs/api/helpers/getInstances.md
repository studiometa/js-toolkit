# getInstances

Use the `getInstances` function to retrieve all instances of a given component.

## Usage

```js
import { Base, getInstances } from '@studiometa/js-toolkit';
import Child from './Child.js';

const children = getInstances(Child);
console.log(children.size); // number
```

**Parameters**

- `ctor` (`typeof Base`): the class from which the instances should be retrieved

**Return value**

- `Set<Base>`: all the instances created with the given class
