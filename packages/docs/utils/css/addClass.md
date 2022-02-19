# addClass

This method will add one or more classes to an HTML element.

## Usage

```js
import { addClass } from '@studiometa/js-toolkit/utils';

addClass(document.body, 'is-locked');
addClass(document.body, ['is-locked', 'has-pointer']);
```

### Parameters

- `element` (`HTMLElement`): the target HTML element
- `classes` (`string | string[]`): CSS classes to add

### Return value

This function does not return anything.
