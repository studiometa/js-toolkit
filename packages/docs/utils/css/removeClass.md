# removeClass

This method will remove one or more classes to an HTML element.

## Usage

```js twoslash
import { removeClass } from '@studiometa/js-toolkit/utils';

removeClass(document.body, 'is-locked');
addClass([document.body, document.documentElement], 'is-locked');
removeClass(document.querySelectorAll('.is-locked'), 'is-locked');
removeClass(document.body, ['is-locked', 'has-pointer']);
```

### Parameters

- `element` (`Element | Element | NodeListOf<Element>`): the target HTML element
- `classes` (`string | string[]`): CSS classes to remove

### Return value

This function does not return anything.
