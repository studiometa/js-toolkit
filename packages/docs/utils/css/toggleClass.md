# toggleClass

This method will toggle one or more classes to an HTML element.

## Usage

```js twoslash
import { toggleClass } from '@studiometa/js-toolkit/utils';

toggleClass(document.body, 'is-locked');
toggleClass(document.body, 'is-locked', true);
toggleClass([document.body, document.documentElement], 'is-locked', true);
toggleClass(document.querySelectorAll('.should-be-locked'), 'is-locked', true);
toggleClass(document.body, ['is-locked', 'has-pointer']);
toggleClass(document.body, ['is-locked', 'has-pointer'], true);
```

### Parameters

- `element` (`Element | Element | NodeListOf<Element>`): the target HTML element
- `classes` (`string | string[]`): CSS classes to remove
- `force` (`boolean`): turns the toggle into a one way-only operation, remove the classes when `false`, add the classes when `true`

### Return value

This function does not return anything.
