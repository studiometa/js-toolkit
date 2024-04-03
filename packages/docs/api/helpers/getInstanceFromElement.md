---
outline: deep
---

# getInstanceFromElement

Use the `getInstanceFromElement` function to get a class instance attached to a DOM element.

## Usage

```js{1,4,6}
import { getInstanceFromElement } from '@studiometa/js-toolkit';
import Component from './Component.js';

const componentInstance = getInstanceFromElement(document.body, Component);
```

**Parameters**

- `element` (`HTMLElement`): the target element
- `BaseConstructor` (`BaseConstructor`): the class (constructor) of the component to look for

**Return value**

- `null | InstanceType<BaseConstructor>`: `null` if the element has no instance of the given type attached, an instance of the given type otherwise
