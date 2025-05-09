# addClass

This method will add one or more classes to an HTML element.

## Usage

```js twoslash
import { addClass } from '@studiometa/js-toolkit/utils';

addClass(document.body, 'is-locked');
addClass([document.body, document.documentElement], 'is-locked');
addClass(document.querySelectorAll('.should-be-locked'), 'is-locked');
addClass(document.body, ['is-locked', 'has-pointer']);
```

### Parameters

- `element` (`Element | Element[] | NodeListOf<Element>`): the target HTML element
- `classes` (`string | string[]`): CSS classes to add

### Return value

This function does not return anything.
