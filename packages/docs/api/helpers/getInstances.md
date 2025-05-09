# getInstances

Use the `getInstances` function to retrieve all mounted instances of every components. You can get instances for a specific component by providing its constructor as first parameter of the function.

## Usage

```js twoslash
import { Base, getInstances } from '@studiometa/js-toolkit';
import Component from './Component.js';

// Get all mounted instances of all components
const instances = getInstances(); // Set<Base>

// Get all mounted instances of the `Component` component
getInstances(Component); // Set<Component>
```

**Parameters**

- `ctor` (`undefined | typeof Base`): the class from which the instances should be retrieved

**Return value**

- `Set<Base>`: all the instances created with the given class
