# removeClass

This method will remove one or more classes to an HTML element.

## Usage

```js
import { removeClass } from '@studiometa/js-toolkit/utils';

removeClass(document.body, 'is-locked');
removeClass(document.body, ['is-locked', 'has-pointer']);
```

### Parameters

- `element` (`HTMLElement`): the target HTML element
- `classes` (`string | string[]`): CSS classes to remove

### Return value

This function does not return anything.
